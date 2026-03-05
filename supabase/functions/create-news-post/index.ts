import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMMUNITIES: Record<string, string> = {
  en: "1af629b2-a08f-4469-a9c3-f9ead3eedf91",
  tr: "bb41b7dd-53a7-4f63-a643-b0f8ef2e871f",
  fr: "d26d53d8-4e3b-4b60-932b-37359124e975",
  es: "fb4057d0-a4a9-44ca-bf9b-0ff29befff77",
  de: "a22428a7-0db8-49a6-b89f-4c3562ec1f48",
  ja: "fcaa23dd-fd82-4fb2-a60b-08a52eb044be",
  hi: "c0122876-e46c-4a18-96f9-b9c336e918f5",
  pt: "2d3993c7-6c3e-4d64-ba67-5760bc4deeda",
  ru: "69f7c33c-d994-49f0-8527-0828798480f5",
  it: "62123ca2-31be-4288-9d91-ef650a477d87",
};

const LANGUAGES = ["en", "tr", "fr", "es", "de", "ja", "hi", "pt", "ru", "it"];
const LANG_NAMES: Record<string, string> = {
  en: "English", tr: "Turkish", fr: "French", es: "Spanish", de: "German",
  ja: "Japanese", hi: "Hindi", pt: "Portuguese", ru: "Russian", it: "Italian",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get profiles to attribute posts/comments to
    const { data: profiles } = await supabase.from("profiles").select("user_id, username").limit(10);
    if (!profiles || profiles.length === 0) throw new Error("No profiles found");

    const body = await req.json().catch(() => ({}));
    const targetLangs: string[] = body.languages || LANGUAGES;
    const customTopic: string | null = body.topic || null;

    const results: any[] = [];

    for (const lang of targetLangs) {
      const langName = LANG_NAMES[lang];
      const communityId = COMMUNITIES[lang];
      const authorId = profiles[Math.floor(Math.random() * profiles.length)].user_id;

      const defaultTopic = `the death of Iran's Supreme Leader Ali Khamenei`;
      const topic = customTopic || defaultTopic;

      const prompt = `Write a brief breaking news article in ${langName} about ${topic}. 

Return ONLY valid JSON (no markdown, no backticks) with this structure:
{
  "title": "news headline in ${langName} (max 100 chars)",
  "content": "2-3 paragraph news article in ${langName}. Write as a news report.",
  "comments": [
    {"text": "a natural reaction comment in ${langName}, 1-3 sentences, like someone reacting to the news on a forum"},
    {"text": "another different perspective comment in ${langName}"},
    {"text": "a third comment with a different viewpoint in ${langName}"}
  ]
}

Write naturally as real news and real people commenting. No emojis. No AI disclaimers.`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        });

        if (!response.ok) throw new Error(`AI error: ${await response.text()}`);
        const data = await response.json();
        let text = data.choices?.[0]?.message?.content || "";
        text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(text);

        // Insert post
        const { data: post, error: postError } = await supabase
          .from("posts")
          .insert({
            title: parsed.title,
            content: parsed.content,
            author_id: authorId,
            community_id: communityId,
            language_code: lang,
          })
          .select("id")
          .single();

        if (postError) throw postError;

        // Insert comments
        const commentAuthors = profiles.filter(p => p.user_id !== authorId);
        for (let i = 0; i < parsed.comments.length && i < commentAuthors.length; i++) {
          await supabase.from("comments").insert({
            post_id: post.id,
            author_id: commentAuthors[i % commentAuthors.length].user_id,
            content: parsed.comments[i].text,
            language_code: lang,
          });
          await new Promise(r => setTimeout(r, 100));
        }

        results.push({ language: lang, status: "success", postId: post.id });
      } catch (err) {
        console.error(`Failed for ${lang}:`, err);
        results.push({ language: lang, status: "error", error: String(err) });
      }

      await new Promise(r => setTimeout(r, 500));
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
