import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Pick the oldest pending comment
    const { data: pending, error: fetchError } = await supabase
      .from("pending_ai_comments")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !pending) {
      return new Response(JSON.stringify({ success: true, message: "No pending comments" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the post still exists
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", pending.post_id)
      .single();

    if (postError || !post) {
      // Post was deleted, mark as failed
      await supabase
        .from("pending_ai_comments")
        .update({ status: "failed", error_message: "Post no longer exists" })
        .eq("id", pending.id);

      return new Response(JSON.stringify({ success: true, message: "Post deleted, skipped" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert the comment into the actual comments table
    const { error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: pending.post_id,
        author_id: pending.author_id,
        content: pending.content,
        language_code: pending.language_code,
      });

    if (commentError) {
      console.error("Failed to post comment:", commentError);
      await supabase
        .from("pending_ai_comments")
        .update({ status: "failed", error_message: commentError.message })
        .eq("id", pending.id);

      return new Response(JSON.stringify({ success: false, error: commentError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as posted
    await supabase
      .from("pending_ai_comments")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", pending.id);

    return new Response(JSON.stringify({ success: true, posted: pending.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("post-pending-comments error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
