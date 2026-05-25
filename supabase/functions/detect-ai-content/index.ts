import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface DetectRequest {
  type: "text" | "image" | "video" | "url";
  text?: string;
  fileDataUrl?: string;
  fileMimeType?: string;
  url?: string;
}

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

const SYSTEM_PROMPT = `You are a rigorous AI-content forensics analyst. Your job is to estimate the probability (0-100) that the supplied content was generated or substantially edited by a generative AI model. You must match or beat the calibration of leading detectors (GPTZero, Originality.ai, Copyleaks, Sapling, Hive, Winston).

CALIBRATION RULES (critical — follow strictly):
- 0-15: Clearly human. Typos, idiosyncratic voice, personal anecdotes, irregular rhythm, factual quirks, dated references, emotional inconsistency, unique slang.
- 16-35: Likely human but some polish. Possibly LLM-edited or grammar-checked.
- 36-64: Genuinely uncertain — mixed signals, short sample, or heavy editing of either origin.
- 65-84: Likely AI. Multiple structural tells present.
- 85-100: Almost certainly AI. Strong, multiple, redundant tells.

DO NOT default to 50. Pick a side when signals point that way. DO NOT collapse to round numbers (50, 75, 90) — give a specific number that reflects evidence weight (e.g., 71, 83, 27).

TEXT TELLS (weigh cumulatively, no single signal is decisive):
ChatGPT/GPT-4/5 family:
- "It's important to note", "It's worth noting", "Certainly!", "Absolutely!", "In conclusion", "In summary", "Overall"
- "not just X, but Y" / "not only X but also Y" antithesis pattern
- "delve", "navigate", "tapestry", "landscape", "realm", "underscore", "showcase", "leverage", "robust", "seamless", "myriad", "multifaceted", "nuanced", "pivotal", "paramount", "intricate", "vibrant"
- em-dashes used in pairs for asides — like this — repeatedly
- Tricolons / rule-of-three lists very frequently
- Perfectly balanced paragraph lengths
- "Remember that...", hedging closers, moralizing conclusions
- Markdown bullet/numbered lists with bolded lead-ins ("**Clarity:** ...")
Claude:
- Long hedged paragraphs, "I'd be happy to", "Let me", explicit structure signposting
- "It's worth considering", careful caveats, balanced both-sides framing
Gemini:
- Slightly stiffer prose, frequent transitional adverbs, encyclopedic tone

Human tells (push DOWN):
- Typos, missing punctuation, inconsistent capitalization
- Run-on sentences, fragments, "lol", "tbh", "imo"
- Personal specifics with verifiable detail (names, dates, places)
- Emotional swings, contradictions, asides that don't resolve
- Regional spelling drift, profanity, sarcasm without explanation

IMAGE TELLS (modern generators have largely fixed hands/eyes — DO NOT require obvious anatomical errors before calling AI. Weight these heavily):
- Skin: poreless, waxy, airbrushed sheen, uniform micro-texture, no peach fuzz, suspiciously symmetric blemishes
- Lighting: too-even key light, missing/contradictory shadows, catchlights that don't match the scene, soft global illumination with no real bounce
- Background: blurred/bokeh that defies any real lens, repeating textures, mushy fine detail, signage that is gibberish or stylized
- Composition: subject perfectly centered, dead-clean negative space, no environmental clutter, generic stock-photo vibe
- Detail consistency: jewelry/clothing seams that don't close, asymmetric earrings, hair strands that fade into nothing, teeth too uniform, iris patterns too perfect
- Color/Tone: oversaturated yet flat, HDR-but-no-real-HDR look, color grade identical across unrelated surfaces
- Resolution: implausibly sharp at every depth (no real lens does this) OR uniformly soft with no grain
- File: NO EXIF camera data, no compression artifacts, perfect codec output
Generator fingerprints:
Midjourney v6/v7: painterly hyperreal lighting, dramatic rim light, cinematic teal-orange grade, perfect symmetry, dreamy depth, glossy skin.
SDXL/SD3/Flux: extremely sharp realism, near-perfect hands now, but tell-tale subject isolation, overly-clean backgrounds, slightly plastic skin.
DALL·E 3 / GPT-Image: cartoonish vibrance, perfectly centered subject, characteristic glow, readable but stylized text, illustrative feel even on "photos".
Firefly: muted palette, slightly soft focus, conservative composition.
Ideogram: clean text rendering but still cartoonish lighting.
Photograph tells (push DOWN, require MULTIPLE before calling human): real lens distortion, motion blur, imperfect focus, visible sensor grain, JPEG compression artifacts, real shadows matching scene geometry, correct readable signage, depth-of-field that matches a real focal length, ambient clutter, candid framing, EXIF-style imperfections.

CRITICAL IMAGE RULE: If an image looks like a "perfect" portrait/landscape/product shot with flawless lighting, plastic-smooth skin, clean background, and no compression/grain — score ≥70 even without a single anatomical error. Modern AI rarely makes hand errors anymore; do not rely on them.

VIDEO TELLS (Sora/Veo/Runway/Kling/Pika):
- Physics drift (objects morphing through each other, gravity off)
- Background warping during camera motion
- Faces inconsistent across frames
- Hands/feet replaced or extra
- Unnaturally smooth interpolation, codec-perfect with no compression artifacts

Also identify the most probable generator BY NAME from: ChatGPT (GPT-4/5), Claude, Gemini, Llama, Mistral, DeepSeek, Grok, Perplexity, Midjourney, DALL·E 3, Stable Diffusion (SD/SDXL/SD3), Flux, Adobe Firefly, Ideogram, Leonardo, Runway, Sora, Pika, Kling, HeyGen, Synthesia, Veo. Use "Unknown" only if content is clearly human or you truly cannot narrow it.

Be specific in signals — quote phrases, name artifacts, point to exact tells. Never refuse. Always return your best estimate via the tool.`;

const tool = {
  type: "function",
  function: {
    name: "report_ai_detection",
    description: "Report AI-generation likelihood and reasoning.",
    parameters: {
      type: "object",
      properties: {
        ai_probability: { type: "number", description: "0-100 probability content is AI-generated. Avoid round numbers; reflect evidence weight." },
        verdict: { type: "string", enum: ["human", "likely_human", "uncertain", "likely_ai", "ai"] },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        signals: {
          type: "array",
          items: { type: "string" },
          description: "4-8 specific observations (quote phrases, name artifacts) that support the verdict.",
        },
        summary: { type: "string", description: "2-3 sentence plain-English summary of why." },
        likely_model: {
          type: "string",
          description: "Most likely AI model/tool by name. Use 'Unknown' only if truly unclear or content is human.",
        },
        model_confidence: { type: "string", enum: ["low", "medium", "high"] },
      },
      required: ["ai_probability", "verdict", "confidence", "signals", "summary", "likely_model", "model_confidence"],
      additionalProperties: false,
    },
  },
};

function deriveVerdict(p: number): "human" | "likely_human" | "uncertain" | "likely_ai" | "ai" {
  if (p < 15) return "human";
  if (p < 40) return "likely_human";
  if (p < 60) return "uncertain";
  if (p < 85) return "likely_ai";
  return "ai";
}

async function callModel(model: string, userContent: any) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "report_ai_detection" } },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`gateway_${resp.status}:${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  const call = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) throw new Error("no_tool_call");
  return JSON.parse(call.function.arguments);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const body = (await req.json()) as DetectRequest;

    let userContent: any;
    let isText = false;
    if (body.type === "text") {
      if (!body.text || body.text.trim().length < 20) {
        return new Response(
          JSON.stringify({ error: "Please provide at least 20 characters of text." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      isText = true;
      userContent = `Analyze the following text for AI-generation likelihood. Apply the calibration rules strictly and quote specific phrases as evidence.\n\n"""\n${body.text.slice(0, 20000)}\n"""`;
    } else if (body.type === "image" || body.type === "video") {
      if (!body.fileDataUrl) {
        return new Response(JSON.stringify({ error: "Missing file data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userContent = [
        { type: "text", text: `Analyze this ${body.type} for AI-generation likelihood. Examine artifacts, anatomy, lighting, text rendering, physics, and known generator tells. Quote concrete artifacts.` },
        { type: "image_url", image_url: { url: body.fileDataUrl } },
      ];
    } else if (body.type === "url") {
      let raw = (body.url ?? "").trim();
      if (!raw) {
        return new Response(JSON.stringify({ error: "Please paste a video URL." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
      let parsed: URL;
      try { parsed = new URL(raw); }
      catch {
        return new Response(JSON.stringify({ error: "That doesn't look like a valid URL." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const url = parsed.toString();
      if (!isKnownVideoHost(url)) {
        return new Response(JSON.stringify({
          error: "Unsupported link. Paste a YouTube, Vimeo, TikTok, X/Twitter, Instagram Reel, or Facebook video URL.",
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const ytId = extractYouTubeId(url);
      const playlistId = url.match(YT_PLAYLIST_REGEX)?.[1] ?? null;
      const oembed = await fetchOEmbed(url);
      if (!ytId && playlistId && YT_HOST_REGEX.test(url) && !oembed) {
        return new Response(JSON.stringify({
          error: "This looks like a YouTube playlist. Paste a single video URL.",
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      let thumbDataUrl: string | null = null;
      if (ytId) {
        thumbDataUrl =
          (await fetchAsDataUrl(`https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`)) ||
          (await fetchAsDataUrl(`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`));
      } else if (oembed?.thumbnail) {
        thumbDataUrl = await fetchAsDataUrl(oembed.thumbnail);
      }
      if (!ytId && !oembed && !thumbDataUrl) {
        return new Response(JSON.stringify({
          error: "Couldn't read this video link. Make sure it's public and try again.",
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const meta = [
        `URL: ${url}`,
        oembed?.title ? `Title: ${oembed.title}` : null,
        oembed?.author ? `Author/Channel: ${oembed.author}` : null,
        ytId ? `YouTube ID: ${ytId}` : null,
      ].filter(Boolean).join("\n");
      const textPart = `Analyze this online video for AI-generation likelihood. We cannot fetch frames, so reason from metadata and ${thumbDataUrl ? "the attached thumbnail" : "the title/channel signals"}. Look for synthetic thumbnails, AI-narration channel patterns, generic stock titles, deepfake indicators.\n\n${meta}`;
      userContent = thumbDataUrl
        ? [{ type: "text", text: textPart }, { type: "image_url", image_url: { url: thumbDataUrl } }]
        : textPart;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensemble: run two strong models in parallel and average for better calibration.
    // For text we use two different model families (better diversity). For images/video we use Gemini Pro (best vision).
    // Ensemble vision models too — single-model image detection was missing many AI images.
    const models = isText
      ? ["google/gemini-2.5-pro", "openai/gpt-5"]
      : ["google/gemini-2.5-pro", "openai/gpt-5"];

    const settled = await Promise.allSettled(models.map((m) => callModel(m, userContent)));
    const results = settled
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => r.value);

    if (results.length === 0) {
      const firstErr = (settled[0] as PromiseRejectedResult)?.reason;
      const msg = String(firstErr?.message ?? firstErr ?? "unknown");
      if (msg.includes("gateway_429")) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (msg.includes("gateway_402")) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("All models failed", msg);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate: average probability, merge signals, pick most-confident model attribution.
    const avg = Math.round(
      results.reduce((s, r) => s + (Number(r.ai_probability) || 0), 0) / results.length,
    );
    const allSignals: string[] = [];
    const seen = new Set<string>();
    for (const r of results) {
      for (const s of (r.signals ?? []) as string[]) {
        const key = s.trim().toLowerCase();
        if (key && !seen.has(key)) { seen.add(key); allSignals.push(s); }
      }
    }
    // Pick model attribution: prefer non-Unknown and highest model_confidence.
    const confRank: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const named = results.filter((r) => r.likely_model && !/unknown/i.test(r.likely_model));
    const pickFrom = named.length ? named : results;
    pickFrom.sort((a, b) => (confRank[b.model_confidence] ?? 0) - (confRank[a.model_confidence] ?? 0));
    const best = pickFrom[0];

    // Overall confidence: if models agree (spread <= 15) -> bump; if disagree (>30) -> downgrade.
    const probs = results.map((r) => Number(r.ai_probability) || 0);
    const spread = Math.max(...probs) - Math.min(...probs);
    let confidence: "low" | "medium" | "high";
    const avgConf = results.reduce((s, r) => s + (confRank[r.confidence] ?? 2), 0) / results.length;
    if (spread > 30) confidence = "low";
    else if (spread <= 12 && avgConf >= 2.5) confidence = "high";
    else confidence = "medium";

    const aggregated = {
      ai_probability: avg,
      verdict: deriveVerdict(avg),
      confidence,
      signals: allSignals.slice(0, 8),
      summary: best.summary,
      likely_model: best.likely_model ?? "Unknown",
      model_confidence: best.model_confidence ?? "low",
    };

    return new Response(JSON.stringify(aggregated), {
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
