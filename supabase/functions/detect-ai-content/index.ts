import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface DetectRequest {
  type: "text" | "image" | "video";
  text?: string;
  // data URL (base64) for image/video
  fileDataUrl?: string;
  fileMimeType?: string;
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
