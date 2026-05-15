import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const NOTIFY_TO = "goodjob3xt@gmail.com";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const escape = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!
  ));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").slice(0, 200);
    const email = String(body.email ?? "").slice(0, 255);
    const company = String(body.company ?? "").slice(0, 200);
    const product = String(body.product ?? "").slice(0, 300);
    const quantity = String(body.quantity ?? "").slice(0, 100);
    const message = String(body.message ?? "").slice(0, 4000);

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
      <h2>New Wholesale Shop Inquiry</h2>
      <p><strong>Name:</strong> ${escape(name)}</p>
      <p><strong>Email:</strong> ${escape(email)}</p>
      ${company ? `<p><strong>Company:</strong> ${escape(company)}</p>` : ""}
      <p><strong>Product:</strong> ${escape(product) || "(not specified)"}</p>
      <p><strong>Quantity:</strong> ${escape(quantity) || "(not specified)"}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${escape(message).replace(/\n/g, "<br/>")}</p>
    `;

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY ?? "",
      },
      body: JSON.stringify({
        from: "Shop Inquiries <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        reply_to: email,
        subject: `Shop Inquiry: ${product || "General"} — ${name}`,
        html,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Resend error", res.status, data);
      return new Response(JSON.stringify({ error: "send_failed", details: data }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
