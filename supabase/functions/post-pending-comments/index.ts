import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth guard: require CRON_SECRET for internal-only access
  const cronSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || cronSecret !== Deno.env.get("CRON_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size || 50;

    // Fetch pending comments
    const { data: pending, error: fetchError } = await supabase
      .from("pending_ai_comments")
      .select("*")
      .eq("status", "pending")
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .limit(batchSize);

    if (fetchError || !pending || pending.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No pending comments", posted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch users to attribute comments to
    const { data: users } = await supabase
      .from("profiles")
      .select("user_id")
      .limit(50);

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let posted = 0;
    let failed = 0;

    for (const item of pending) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const { error: commentError } = await supabase
        .from("comments")
        .insert({
          post_id: item.target_post_id,
          content: item.comment_text,
          language_code: item.language_code,
          author_id: randomUser.user_id,
        });

      if (commentError) {
        console.error("Failed to post comment:", commentError);
        await supabase
          .from("pending_ai_comments")
          .update({ status: "failed" })
          .eq("id", item.id);
        failed++;
      } else {
        await supabase
          .from("pending_ai_comments")
          .update({ status: "posted", posted_at: new Date().toISOString() })
          .eq("id", item.id);
        posted++;
      }
    }

    return new Response(JSON.stringify({ success: true, posted, failed, total: pending.length }), {
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
