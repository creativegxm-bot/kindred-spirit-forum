import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "tr", name: "Turkish" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "hi", name: "Hindi" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "it", name: "Italian" },
];

const STORY_CONCEPTS = [
  { num: 1, theme: "A brave little rabbit who helps a lost butterfly find its garden", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800" },
  { num: 2, theme: "A tiny star that falls from the sky and befriends a child", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800" },
  { num: 3, theme: "A magical tree that grows candy and teaches sharing", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800" },
  { num: 4, theme: "A little fish who dreams of seeing the mountains", image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800" },
  { num: 5, theme: "A shy cloud who is afraid of thunder but learns courage", image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800" },
  { num: 6, theme: "Two best friends — a cat and a dog — going on a treasure hunt", image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800" },
  { num: 7, theme: "A little seed that refuses to grow until it hears a kind word", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800" },
  { num: 8, theme: "A teddy bear who comes alive at night to protect a child from bad dreams", image: "https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=800" },
  { num: 9, theme: "A penguin who wants to fly and discovers a different kind of flying", image: "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=800" },
  { num: 10, theme: "A rainbow that loses its colors and children help find them", image: "https://images.unsplash.com/photo-1507919909716-c8262e491cde?w=800" },
  { num: 11, theme: "A kind dragon who bakes cookies for the village children", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800" },
  { num: 12, theme: "A pair of shoes that can walk by themselves and go on adventures", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
  { num: 13, theme: "A moon who is lonely and befriends the fireflies", image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800" },
  { num: 14, theme: "A little girl who discovers she can talk to flowers", image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800" },
  { num: 15, theme: "An elephant who paints pictures with his trunk and inspires the jungle", image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800" },
  { num: 16, theme: "A snowflake who doesn't want to melt and finds a forever home", image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800" },
  { num: 17, theme: "A boy who builds a boat from a leaf and sails across a puddle ocean", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800" },
  { num: 18, theme: "A wise owl teaches forest animals the importance of listening", image: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=800" },
  { num: 19, theme: "A music box that plays a different song for each emotion", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
  { num: 20, theme: "A child who collects smiles and gives them to sad people", image: "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=800" },
];

async function generateStoriesForLanguage(
  language: { code: string; name: string },
  stories: typeof STORY_CONCEPTS,
  apiKey: string
) {
  const prompt = `Generate ${stories.length} children's bedtime stories in ${language.name} language. Each story should be for ages 4-10 and around 4-6 paragraphs long.

For each story, output a JSON array with objects containing:
- "num": the story number
- "title": story title in ${language.name}
- "summary": 1-2 sentence summary in ${language.name}
- "content": the full story text in ${language.name} (paragraphs separated by \\n\\n)
- "moral": the moral/lesson of the story in ${language.name} (1 sentence)
- "read_time": estimated read time in minutes (integer, usually 3-5)

Here are the story themes:
${stories.map((s, i) => `${i + 1}. Story #${s.num}: ${s.theme}`).join("\n")}

IMPORTANT: Return ONLY valid JSON array. No markdown, no backticks, no explanation. Write naturally and engagingly for children. Stories must be entirely in ${language.name}.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error for ${language.name}: ${err}`);
  }

  const data = await response.json();
  let text = data.choices?.[0]?.message?.content || "";
  
  // Clean markdown code blocks
  text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  
  return JSON.parse(text);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const targetLang = body.language_code; // optional: generate for specific language only
    const batchStart = body.batch_start || 0; // story index start (0-based)
    const batchSize = body.batch_size || 10; // how many stories per call

    const languages = targetLang
      ? LANGUAGES.filter((l) => l.code === targetLang)
      : LANGUAGES;

    const storiesToGenerate = STORY_CONCEPTS.slice(batchStart, batchStart + batchSize);
    const results: any[] = [];

    for (const lang of languages) {
      console.log(`Generating ${storiesToGenerate.length} stories for ${lang.name}...`);

      try {
        const generated = await generateStoriesForLanguage(lang, storiesToGenerate, apiKey);

        const rows = generated.map((g: any) => {
          const concept = storiesToGenerate.find((s) => s.num === g.num) || storiesToGenerate[0];
          return {
            story_number: g.num,
            title: g.title,
            summary: g.summary,
            content: g.content,
            moral: g.moral,
            image_url: concept.image,
            language_code: lang.code,
            read_time: g.read_time || 3,
            age_range: "4-10",
          };
        });

        const { error } = await supabase
          .from("children_stories")
          .upsert(rows, { onConflict: "story_number,language_code" });

        if (error) {
          console.error(`DB error for ${lang.name}:`, error);
          results.push({ language: lang.code, status: "error", error: error.message });
        } else {
          results.push({ language: lang.code, status: "success", count: rows.length });
        }
      } catch (err) {
        console.error(`Failed for ${lang.name}:`, err);
        results.push({ language: lang.code, status: "error", error: String(err) });
      }

      // Small delay between languages to avoid rate limits
      await new Promise((r) => setTimeout(r, 1000));
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
