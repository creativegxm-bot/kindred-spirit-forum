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
    const { imageBase64, targetAge } = await req.json();

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

    const prompt = `Transform this person's face to show how they would look at age ${targetAge}. 
Keep the same person, same facial features, same identity, but age them realistically to ${targetAge} years old.
Show natural aging effects appropriate for that age - wrinkles, skin texture changes, hair graying if applicable.
Maintain the same background, lighting, and photo style. Keep it realistic and respectful.`;

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
    
    // Check multiple possible locations for the image
    let agedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    // Alternative: Check if it's directly in the content
    if (!agedImageUrl && data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      // Check if content contains base64 image data
      if (typeof content === 'string' && content.includes('data:image')) {
        const match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (match) {
          agedImageUrl = match[0];
        }
      }
    }
    
    const textResponse = data.choices?.[0]?.message?.content;

    if (!agedImageUrl) {
      console.error("No image in response:", data);
      throw new Error("No image generated. The AI model may not have processed the image correctly.");
    }

    return new Response(
      JSON.stringify({ 
        agedImageUrl,
        message: typeof textResponse === 'string' ? textResponse : "Age transformation complete!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("age-progression error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
