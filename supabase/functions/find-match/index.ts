import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, gender, style } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const matchGender = gender === "boyfriend" ? "male" : "female";
    const styleDesc = style === "realistic" 
      ? "photorealistic, natural lighting, professional photography" 
      : style === "anime" 
        ? "anime style, beautiful anime character, studio quality"
        : "artistic portrait, painterly style, elegant";

    const prompt = `Based on the person in this photo, generate an image of their ideal romantic partner.
Create a beautiful, attractive ${matchGender} person who would be a perfect match for someone like the person in the photo.
The generated person should complement the style and vibe of the original person.
Style: ${styleDesc}
Generate a portrait photo showing the face and upper body.
Make it look natural, appealing, and high quality.
Do NOT include the original person in the output - only generate their ideal match.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI processing failed");
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));
    
    let matchImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!matchImageUrl && data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      if (typeof content === 'string' && content.includes('data:image')) {
        const match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (match) {
          matchImageUrl = match[0];
        }
      }
    }
    
    const textResponse = data.choices?.[0]?.message?.content;

    if (!matchImageUrl) {
      console.error("No image in response:", data);
      throw new Error("No image generated. Please try again with a different photo.");
    }

    return new Response(
      JSON.stringify({ 
        matchImageUrl,
        message: typeof textResponse === 'string' ? textResponse : "Your ideal match has been generated!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("find-match error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
