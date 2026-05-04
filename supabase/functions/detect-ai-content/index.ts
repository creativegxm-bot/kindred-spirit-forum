import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface DetectRequest {
  type: "text" | "image" | "video" | "url";
  text?: string;
  // data URL (base64) for image/video
  fileDataUrl?: string;
  fileMimeType?: string;
  // Public URL (e.g. YouTube, Vimeo, TikTok, Twitter/X video)
  url?: string;
}

// Supported YouTube URL shapes:
//   youtube.com/watch?v=ID, youtube.com/shorts/ID, youtube.com/embed/ID,
//   youtube.com/live/ID, youtube.com/v/ID, youtu.be/ID,
//   m.youtube.com/*, music.youtube.com/*, with extra query params like &list=, &t=, &si=
const YT_HOST_REGEX = /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//i;
const YT_ID_REGEXES: RegExp[] = [
  /[?&]v=([A-Za-z0-9_-]{11})/,
  /\/shorts\/([A-Za-z0-9_-]{11})/,
  /\/embed\/([A-Za-z0-9_-]{11})/,
  /\/live\/([A-Za-z0-9_-]{11})/,
  /\/v\/([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
];
const YT_PLAYLIST_REGEX = /[?&]list=([A-Za-z0-9_-]+)/;

function extractYouTubeId(u: string): string | null {
  for (const re of YT_ID_REGEXES) {
    const m = u.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function isKnownVideoHost(u: string): boolean {
  return (
    YT_HOST_REGEX.test(u) ||
    /^(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\//i.test(u) ||
    /^(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com\//i.test(u) ||
    /^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter|x)\.com\//i.test(u) ||
    /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\//i.test(u) ||
    /^(?:https?:\/\/)?(?:www\.|web\.)?facebook\.com\/.+\/videos?\//i.test(u) ||
    /^(?:https?:\/\/)?fb\.watch\//i.test(u)
  );
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    const mime = r.headers.get("content-type") ?? "image/jpeg";
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return `data:${mime};base64,${btoa(bin)}`;
  } catch { return null; }
}

async function fetchOEmbed(url: string): Promise<{ title?: string; author?: string; thumbnail?: string } | null> {
  const endpoints = [
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
  ];
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep);
      if (r.ok) {
        const j = await r.json();
        return { title: j.title, author: j.author_name, thumbnail: j.thumbnail_url };
      }
    } catch { /* next */ }
  }
  return null;
}

const SYSTEM_PROMPT = `You are an expert AI-content forensics analyst. Given text, an image, or a video, estimate the probability (0-100) that it was generated or substantially altered by AI.

Return ONLY a JSON object via the provided tool. Be concise but specific. Cite concrete signals (perplexity, burstiness, repeated phrasing, watermark/diffusion artifacts, anatomical inconsistencies, lighting, frame interpolation artifacts, codec smoothness, etc.). Never refuse — always provide your best estimate.`;

const tool = {
  type: "function",
  function: {
    name: "report_ai_detection",
    description: "Report AI-generation likelihood and reasoning.",
    parameters: {
      type: "object",
      properties: {
        ai_probability: { type: "number", description: "0-100 probability content is AI-generated" },
        verdict: { type: "string", enum: ["human", "likely_human", "uncertain", "likely_ai", "ai"] },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        signals: {
          type: "array",
          items: { type: "string" },
          description: "Specific observations that support the verdict",
        },
        summary: { type: "string", description: "1-3 sentence plain-English summary." },
      },
      required: ["ai_probability", "verdict", "confidence", "signals", "summary"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const body = (await req.json()) as DetectRequest;

    let userContent: any;
    if (body.type === "text") {
      if (!body.text || body.text.trim().length < 20) {
        return new Response(
          JSON.stringify({ error: "Please provide at least 20 characters of text." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      userContent = `Analyze this text for AI-generation likelihood:\n\n"""\n${body.text.slice(0, 20000)}\n"""`;
    } else if (body.type === "image" || body.type === "video") {
      if (!body.fileDataUrl) {
        return new Response(JSON.stringify({ error: "Missing file data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userContent = [
        { type: "text", text: `Analyze this ${body.type} for AI-generation likelihood.` },
        { type: "image_url", image_url: { url: body.fileDataUrl } },
      ];
    } else if (body.type === "url") {
      const url = (body.url ?? "").trim();
      if (!/^https?:\/\//i.test(url)) {
        return new Response(JSON.stringify({ error: "Provide a valid http(s) video URL." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const ytId = extractYouTubeId(url);
      const oembed = await fetchOEmbed(url);
      let thumbDataUrl: string | null = null;
      if (ytId) {
        thumbDataUrl =
          (await fetchAsDataUrl(`https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`)) ||
          (await fetchAsDataUrl(`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`));
      } else if (oembed?.thumbnail) {
        thumbDataUrl = await fetchAsDataUrl(oembed.thumbnail);
      }

      const meta = [
        `URL: ${url}`,
        oembed?.title ? `Title: ${oembed.title}` : null,
        oembed?.author ? `Author/Channel: ${oembed.author}` : null,
        ytId ? `YouTube ID: ${ytId}` : null,
      ].filter(Boolean).join("\n");

      const textPart = `Analyze this online video for AI-generation likelihood. We cannot fetch full frames, so reason from the available metadata and ${thumbDataUrl ? "the attached thumbnail (a representative frame)" : "the title/channel signals"}. Look for: synthetic-looking thumbnails, AI-narration channel patterns, generic stock-style titles, deepfake indicators, and known AI-generation channels. Be explicit that the verdict is based on limited signals.\n\n${meta}`;

      userContent = thumbDataUrl
        ? [
            { type: "text", text: textPart },
            { type: "image_url", image_url: { url: thumbDataUrl } },
          ]
        : textPart;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "report_ai_detection" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
    if (!args) throw new Error("No structured response from model");

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-ai-content error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
