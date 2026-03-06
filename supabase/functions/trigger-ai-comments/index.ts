import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPPORTED_LANGUAGES = ["tr", "en", "de", "fr", "es", "hi", "zh", "ja", "pt", "ru", "it", "he"];

const LANG_PROMPTS: Record<string, string> = {
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
  he: "כתוב תגובה קצרה וטבעית בעברית.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const targetLangs: string[] = body.languages || SUPPORTED_LANGUAGES;
    const commentsPerLang: number = body.count || 2;
    const postNow: boolean = body.post_now || false; // If true, post directly instead of queuing

    // Fetch users once
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("user_id, username")
      .limit(50);

    if (usersError || !users || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { lang: string; generated: number; posted: number; errors: string[] }[] = [];

    for (const lang of targetLangs) {
      if (!SUPPORTED_LANGUAGES.includes(lang)) continue;

      const langResult = { lang, generated: 0, posted: 0, errors: [] as string[] };

      // Fetch recent posts in this language
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, content, author_id")
        .eq("language_code", lang)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!posts || posts.length === 0) {
        langResult.errors.push("No posts found");
        results.push(langResult);
        continue;
      }

      // Comment on ALL posts, not just a subset
      const selectedPosts = posts;

      for (const post of selectedPosts) {
        const eligibleUsers = users.filter(u => u.user_id !== post.author_id);
        if (eligibleUsers.length === 0) continue;
        const randomUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];

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
                {
                  role: "system",
                  content: `You are a forum user commenting on a post. ${LANG_PROMPTS[lang] || LANG_PROMPTS.en} Keep it under 2-3 sentences. Be conversational, not robotic. Don't mention AI. Vary your tone. Reply with ONLY the comment text.`,
                },
                {
                  role: "user",
                  content: `Post title: "${post.title}"\nPost content: "${post.content || "(no body)"}"`,
                },
              ],
            }),
          });

          if (!aiResponse.ok) {
            langResult.errors.push(`AI error: ${aiResponse.status}`);
            continue;
          }

          const aiData = await aiResponse.json();
          const commentContent = aiData.choices?.[0]?.message?.content?.trim();
          if (!commentContent || commentContent.length < 5) continue;

          if (postNow) {
            // Post directly to comments table
            const { error: commentError } = await supabase.from("comments").insert({
              post_id: post.id,
              author_id: randomUser.user_id,
              content: commentContent,
              language_code: lang,
            });
            if (commentError) {
              langResult.errors.push(commentError.message);
            } else {
              langResult.posted++;
            }
          } else {
            // Queue as pending
            const { error: insertError } = await supabase.from("pending_ai_comments").insert({
              target_post_id: post.id,
              comment_text: commentContent,
              language_code: lang,
              status: "pending",
            });
            if (insertError) {
              langResult.errors.push(insertError.message);
            } else {
              langResult.generated++;
            }
          }
        } catch (err) {
          langResult.errors.push(err instanceof Error ? err.message : "Unknown AI error");
        }

        await new Promise(r => setTimeout(r, 300));
      }

      results.push(langResult);
    }

    const totalGenerated = results.reduce((s, r) => s + r.generated, 0);
    const totalPosted = results.reduce((s, r) => s + r.posted, 0);

    return new Response(JSON.stringify({
      success: true,
      total_generated: totalGenerated,
      total_posted: totalPosted,
      details: results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trigger-ai-comments error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
