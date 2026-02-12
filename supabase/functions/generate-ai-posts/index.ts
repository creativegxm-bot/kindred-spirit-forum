import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["jobs", "housing", "services", "forsale", "general"];

const LANG_CONFIG: Record<string, { categories: Record<string, string>; prompt: string }> = {
  en: {
    categories: {
      jobs: "Jobs",
      housing: "Housing",
      services: "Services-EN",
      forsale: "ForSale",
      general: "General-EN",
    },
    prompt: `You generate realistic classified-style posts for a Craigslist-style community website in English.
Each post must have a title and content. Reference concrete details: price, location, timing, requirements, availability.
No vague phrasing. No emojis. Natural human tone. Posts should cover jobs, housing, services, items for sale, and general community topics.`,
  },
  fr: {
    categories: {
      jobs: "Emploi",
      housing: "Logement",
      services: "Services-FR",
      forsale: "Ventes",
      general: "General-FR",
    },
    prompt: `Vous générez des annonces réalistes pour un site communautaire de type Craigslist en français.
Chaque annonce doit avoir un titre et un contenu. Mentionnez des détails concrets : prix, localisation, horaires, exigences, disponibilité.
Pas de formulations vagues. Pas d'emojis. Ton humain et naturel. Les annonces couvrent emploi, logement, services, ventes et sujets communautaires.`,
  },
  es: {
    categories: {
      jobs: "Empleos",
      housing: "Vivienda",
      services: "Servicios",
      forsale: "Ventas",
      general: "General-ES",
    },
    prompt: `Generas publicaciones realistas estilo clasificados para un sitio comunitario tipo Craigslist en español.
Cada publicación debe tener título y contenido. Menciona detalles concretos: precio, ubicación, horarios, requisitos, disponibilidad.
Sin frases vagas. Sin emojis. Tono humano y natural. Las publicaciones cubren empleo, vivienda, servicios, ventas y temas comunitarios.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const targetLangs: string[] = body.languages || ["en", "fr", "es"];
    const postsPerLang: number = body.count || 15;

    // Fetch users to attribute posts to
    const { data: users } = await supabase
      .from("profiles")
      .select("user_id, username")
      .limit(50);

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch community IDs per language
    const { data: communities } = await supabase
      .from("communities")
      .select("id, name, language_code");

    if (!communities || communities.length === 0) {
      return new Response(JSON.stringify({ error: "No communities found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { lang: string; posted: number; errors: string[] }[] = [];

    for (const lang of targetLangs) {
      const config = LANG_CONFIG[lang];
      if (!config) continue;

      const langResult = { lang, posted: 0, errors: [] as string[] };

      // Resolve community IDs for this language
      const communityMap: Record<string, string> = {};
      for (const [cat, communityName] of Object.entries(config.categories)) {
        const found = communities.find(
          (c) => c.name === communityName && c.language_code === lang
        );
        if (found) communityMap[cat] = found.id;
      }

      if (Object.keys(communityMap).length === 0) {
        langResult.errors.push("No matching communities found");
        results.push(langResult);
        continue;
      }

      // Generate posts via AI
      const userPrompt = `Generate exactly ${postsPerLang} classified-style posts.
Each post must belong to one of these categories: ${CATEGORIES.join(", ")}.
Distribute roughly evenly across categories.

Return ONLY valid JSON with this structure:
{
  "posts": [
    {"category": "jobs", "title": "Short title here", "content": "Detailed post content with concrete details"},
    ...
  ]
}

No explanations. No markdown. Only JSON.`;

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
              { role: "system", content: config.prompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!aiResponse.ok) {
          langResult.errors.push(`AI error: ${aiResponse.status}`);
          results.push(langResult);
          continue;
        }

        const aiData = await aiResponse.json();
        let rawContent = aiData.choices?.[0]?.message?.content?.trim() || "";

        // Strip markdown code fences if present
        rawContent = rawContent.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");

        let parsed: { posts: { category: string; title: string; content: string }[] };
        try {
          parsed = JSON.parse(rawContent);
        } catch {
          langResult.errors.push("Failed to parse AI JSON response");
          results.push(langResult);
          continue;
        }

        if (!parsed.posts || !Array.isArray(parsed.posts)) {
          langResult.errors.push("Invalid AI response structure");
          results.push(langResult);
          continue;
        }

        // Insert posts
        for (const post of parsed.posts) {
          const cat = post.category?.toLowerCase() || "general";
          const communityId = communityMap[cat] || communityMap["general"];
          if (!communityId) continue;

          const randomUser = users[Math.floor(Math.random() * users.length)];

          const { error: insertError } = await supabase.from("posts").insert({
            title: post.title,
            content: post.content,
            community_id: communityId,
            author_id: randomUser.user_id,
            language_code: lang,
          });

          if (insertError) {
            langResult.errors.push(insertError.message);
          } else {
            langResult.posted++;
          }
        }
      } catch (err) {
        langResult.errors.push(err instanceof Error ? err.message : "Unknown error");
      }

      // Delay between languages to avoid rate limiting
      await new Promise((r) => setTimeout(r, 2000));

      results.push(langResult);
    }

    const totalPosted = results.reduce((s, r) => s + r.posted, 0);

    return new Response(
      JSON.stringify({ success: true, total_posted: totalPosted, details: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-ai-posts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
