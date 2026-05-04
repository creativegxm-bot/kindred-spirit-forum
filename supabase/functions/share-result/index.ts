import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://ondabir.com";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const verdictLabel: Record<string, string> = {
  human: "Human-written",
  likely_human: "Likely human",
  uncertain: "Uncertain",
  likely_ai: "Likely AI",
  ai: "AI-generated",
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  // Path: /functions/v1/share-result/<id>
  const id = url.pathname.split("/").pop();
  if (!id) return new Response("Not found", { status: 404 });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data, error } = await supabase
    .from("detection_results")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return new Response("Result not found", { status: 404 });

  const verdict = verdictLabel[data.verdict] ?? data.verdict;
  const pct = Math.round(Number(data.ai_probability));
  const title = `${verdict} — ${pct}% AI probability`;
  const description = (data.summary as string).slice(0, 280);
  const targetUrl = `${SITE_URL}/r/${id}`;
  const image = data.preview_url || `${SITE_URL}/og-image.png`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} | AI Content Detector</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${targetUrl}" />

<meta property="og:type" content="article" />
<meta property="og:url" content="${targetUrl}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:site_name" content="AI Content Detector" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />

<meta http-equiv="refresh" content="0; url=${targetUrl}" />
<script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</head>
<body>
<p>Redirecting to <a href="${targetUrl}">${esc(title)}</a>…</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});
