import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CommentNotificationPayload {
  type: "INSERT";
  table: "comments";
  record: {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
  };
}

async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "OndaBir <notifications@ondabir.com>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Resend API error:", error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: CommentNotificationPayload = await req.json();
    const { record } = payload;

    // Get commenter info
    const { data: commenter } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", record.author_id)
      .maybeSingle();

    // Get post info and author
    const { data: post } = await supabase
      .from("posts")
      .select("title, author_id, community_id")
      .eq("id", record.post_id)
      .maybeSingle();

    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get post author's email
    const { data: postAuthorAuth } = await supabase.auth.admin.getUserById(post.author_id);

    if (!postAuthorAuth?.user?.email) {
      return new Response(JSON.stringify({ message: "No email for post author" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Don't send email if commenter is the post author
    if (record.author_id === post.author_id) {
      return new Response(JSON.stringify({ message: "Author commented on own post" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const commenterName = commenter?.username || "Birisi";
    const postTitle = post.title.length > 50 ? post.title.substring(0, 50) + "..." : post.title;
    const commentPreview = record.content.length > 100 ? record.content.substring(0, 100) + "..." : record.content;

    // Check if this is a reply to another comment
    if (record.parent_id) {
      // This is a reply - also notify the parent comment author
      const { data: parentComment } = await supabase
        .from("comments")
        .select("author_id")
        .eq("id", record.parent_id)
        .maybeSingle();

      if (parentComment && parentComment.author_id !== record.author_id) {
        const { data: parentAuthorAuth } = await supabase.auth.admin.getUserById(parentComment.author_id);
        
        if (parentAuthorAuth?.user?.email) {
          // Send reply notification to parent comment author
          await sendEmail(
            parentAuthorAuth.user.email,
            `${commenterName} yorumunuza yanıt verdi`,
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Yorumunuza Yanıt</h2>
                <p style="color: #666;">${commenterName} yorumunuza yanıt verdi:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="color: #333; margin: 0;">"${commentPreview}"</p>
                </div>
                <p style="color: #888; font-size: 14px;">Gönderi: ${postTitle}</p>
                <a href="https://ondabir.com/post/${record.post_id}" style="display: inline-block; background-color: #FF4500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Yanıtı Görüntüle</a>
              </div>
            `
          );
        }
      }
    }

    // Send notification to post author
    await sendEmail(
      postAuthorAuth.user.email,
      `${commenterName} gönderinize yorum yaptı`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Gönderinize Yeni Yorum</h2>
          <p style="color: #666;">${commenterName} "${postTitle}" başlıklı gönderinize yorum yaptı:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="color: #333; margin: 0;">"${commentPreview}"</p>
          </div>
          <a href="https://ondabir.com/post/${record.post_id}" style="display: inline-block; background-color: #FF4500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Yorumu Görüntüle</a>
        </div>
      `
    );

    console.log("Email notification sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-comment-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
