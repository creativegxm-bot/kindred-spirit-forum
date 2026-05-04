// Build-time prerender for /blog and /blog/:slug.
// Crawlers (Twitter/X, Facebook, LinkedIn, Slack, iMessage, WhatsApp) don't run JS,
// so we bake per-route <title>, meta tags, canonical, robots, and JSON-LD into static HTML.
// Users still get the full SPA — React hydrates and takes over after first paint.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SITE = "https://ondabir.com";

// ---------- parse blogPosts.ts ----------
const src = await readFile(join(ROOT, "src/data/blogPosts.ts"), "utf8");
const posts = [];
const blockRe = /\{\s*slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*excerpt:\s*\n?\s*"([\s\S]*?)",\s*date:\s*"([^"]+)",\s*readTime:\s*"([^"]+)",\s*tags:\s*\[([^\]]+)\]/g;
let m;
while ((m = blockRe.exec(src)) !== null) {
  posts.push({
    slug: m[1],
    title: m[2],
    excerpt: m[3].replace(/\s+/g, " ").trim(),
    date: m[4],
    readTime: m[5],
    tags: m[6].split(",").map((t) => t.trim().replace(/^"|"$/g, "")),
  });
}
if (posts.length === 0) {
  console.warn("[prerender] No blog posts parsed — skipping.");
  process.exit(0);
}

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const truncate = (s, n) => (s.length > n ? s.slice(0, n - 3) + "..." : s);

const indexHtml = await readFile(join(DIST, "index.html"), "utf8");

const buildHead = ({ title, description, canonical, ogType, robots, jsonLd }) => {
  const t = esc(truncate(title, 60));
  const d = esc(truncate(description, 160));
  const u = esc(canonical);
  const img = `${SITE}/og-image.png`;
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${esc(robots)}" />`,
    `<link rel="canonical" href="${u}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${u}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");
};

// Strip shell tags that we're about to override (title, description, robots, canonical,
// og:*, twitter:*) so crawlers see only the per-route values.
const renderShell = (headBlock) => {
  let out = indexHtml.replace(/<title>[\s\S]*?<\/title>/i, "");
  out = out.replace(/<meta\s+name="description"[^>]*>\s*/gi, "");
  out = out.replace(/<meta\s+name="robots"[^>]*>\s*/gi, "");
  out = out.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "");
  out = out.replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "");
  out = out.replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "");
  return out.replace(/<\/head>/i, `    ${headBlock}\n  </head>`);
};

const writeRoute = async (route, html) => {
  const dir = join(DIST, route);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html, "utf8");
  console.log(`[prerender] wrote /${route}/index.html`);
};

// ---------- /blog ----------
const publisher = {
  "@type": "Organization",
  name: "AI Content Detector",
  url: SITE,
  logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
};
const author = { "@type": "Organization", name: "AI Content Detector Editorial", url: `${SITE}/blog` };

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "AI Detection Blog",
  description:
    "Practical guides on detecting AI-generated text, images, and video — how detectors work, what signals matter, and the limits of every tool.",
  url: `${SITE}/blog`,
  inLanguage: "en",
  publisher,
  author,
  blogPost: posts.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    url: `${SITE}/blog/${p.slug}`,
    datePublished: p.date,
    dateModified: p.date,
    author,
    publisher,
    keywords: p.tags.join(", "),
  })),
};

await writeRoute(
  "blog",
  renderShell(
    buildHead({
      title: "AI Detection Blog – Guides on Spotting AI Text, Images & Video",
      description:
        "Practical guides on detecting AI-generated text, images, and video — how detectors work, what signals matter, and the limits of every tool.",
      canonical: `${SITE}/blog`,
      ogType: "website",
      robots: "index,follow,max-image-preview:large,max-snippet:-1",
      jsonLd: blogJsonLd,
    }),
  ),
);

// ---------- /blog/:slug ----------
const sectionMap = {
  text: "AI Text Detection",
  image: "AI Image Detection",
  video: "AI Video Detection",
  deepfake: "Deepfake Detection",
  scams: "AI Safety",
  detection: "Detection Fundamentals",
  "how-it-works": "Detection Fundamentals",
  limits: "Detection Fundamentals",
};

for (const post of posts) {
  const canonical = `${SITE}/blog/${post.slug}`;
  const articleSection = post.tags.map((t) => sectionMap[t]).find(Boolean) ?? "AI Detection";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author,
    publisher,
    image: `${SITE}/og-image.png`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    articleSection,
    keywords: post.tags.join(", "),
    inLanguage: "en",
  };
  await writeRoute(
    `blog/${post.slug}`,
    renderShell(
      buildHead({
        title: `${post.title} | AI Detection Blog`,
        description: post.excerpt,
        canonical,
        ogType: "article",
        robots: "index,follow,max-image-preview:large,max-snippet:-1",
        jsonLd,
      }),
    ),
  );
}

console.log(`[prerender] done — ${posts.length + 1} routes prerendered.`);
