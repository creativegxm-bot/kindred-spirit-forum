import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPPORTED_LANGUAGES = ["tr", "en", "de", "fr", "es", "hi", "zh", "ja", "pt", "ru", "it"];

// How many comments to generate per language per run
const COMMENTS_PER_LANGUAGE = 2;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth guard: require CRON_SECRET for internal-only access
  const cronSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || cronSecret !== Deno.env.get("CRON_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let totalGenerated = 0;

    for (const lang of SUPPORTED_LANGUAGES) {
      // Fetch recent posts in this language (last 7 days, up to 10)
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id, title, content, language_code, community_id")
        .eq("language_code", lang)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (postsError || !posts || posts.length === 0) continue;

      // Comment on ALL posts, not just a subset
      const selectedPosts = posts;

      // Fetch random existing users to attribute comments to
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("user_id, username")
        .limit(50);

      if (usersError || !users || users.length === 0) continue;

      for (const post of selectedPosts) {
        // Pick a random user (not the post author)
        const eligibleUsers = users.filter(u => u.user_id !== (post as any).author_id);
        if (eligibleUsers.length === 0) continue;
        const randomUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];

        // Generate comment via Lovable AI
        const langPrompts: Record<string, string> = {
          tr: "Türkçe olarak kısa ve doğal bir yorum yaz.",
          en: "Write a short, natural comment in English.",
          de: "Schreibe einen kurzen, natürlichen Kommentar auf Deutsch.",
          fr: "Écris un court commentaire naturel en français.",
          es: "Escribe un comentario breve y natural en español.",
          hi: "हिंदी में एक छोटी और प्राकृतिक टिप्पणी लिखें।",
          zh: "用中文写一条简短自然的评论。",
          ja: "日本語で短く自然なコメントを書いてください。",
          pt: "Escreva um comentário curto e natural em português.",
          ru: "Напишите короткий и естественный комментарий на русском.",
          it: "Scrivi un breve commento naturale in italiano.",
        };

        const systemPrompt = `You are a forum user commenting on a post. ${langPrompts[lang] || langPrompts.en} 
Keep it under 2-3 sentences. Be conversational, not robotic. Don't mention AI. 
Vary your tone - sometimes agree, sometimes share a related thought, sometimes ask a follow-up question.
Reply with ONLY the comment text, nothing else.`;

        const userPrompt = `Post title: "${post.title}"
Post content: "${post.content || "(no body text)"}"`;

        try {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
            }),
          });

          if (!aiResponse.ok) {
            console.error(`AI error for lang ${lang}:`, aiResponse.status);
            continue;
          }

          const aiData = await aiResponse.json();
          const commentContent = aiData.choices?.[0]?.message?.content?.trim();

          if (!commentContent || commentContent.length < 5) continue;

          // Store as pending
          const { error: insertError } = await supabase
            .from("pending_ai_comments")
            .insert({
              target_post_id: post.id,
              comment_text: commentContent,
              language_code: lang,
              status: "pending",
            });

          if (insertError) {
            console.error(`Insert error:`, insertError);
          } else {
            totalGenerated++;
          }
        } catch (aiErr) {
          console.error(`AI call failed for post ${post.id}:`, aiErr);
        }

        // Small delay between AI calls to avoid rate limiting
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    return new Response(JSON.stringify({ success: true, generated: totalGenerated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ai-comments error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
