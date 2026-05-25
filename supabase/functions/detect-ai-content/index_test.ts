// Integration tests for detect-ai-content.
// Hits the deployed edge function with known fixtures and asserts the
// calibration thresholds we care about. Run with the edge-function test tool.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { IMAGE_FIXTURES } from "./fixtures.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY =
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  Deno.env.get("SUPABASE_ANON_KEY")!;

const FN_URL = `${SUPABASE_URL}/functions/v1/detect-ai-content`;

async function fetchAsDataUrl(url: string): Promise<{ dataUrl: string; mime: string }> {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`fixture fetch ${r.status} for ${url}`);
  const mime = r.headers.get("content-type") ?? "image/jpeg";
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return { dataUrl: `data:${mime};base64,${btoa(bin)}`, mime };
}

async function detectImage(dataUrl: string, mime: string) {
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ type: "image", fileDataUrl: dataUrl, fileMimeType: mime }),
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`detect ${resp.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as {
    ai_probability: number;
    verdict: string;
    confidence: string;
    signals: string[];
    summary: string;
    likely_model: string;
  };
}

Deno.test("rejects text below 20 chars", async () => {
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ type: "text", text: "too short" }),
  });
  const body = await resp.json();
  assertEquals(resp.status, 400);
  assert(typeof body.error === "string");
});

Deno.test("rejects image without fileDataUrl", async () => {
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ type: "image" }),
  });
  await resp.text();
  assertEquals(resp.status, 400);
});

Deno.test("rejects unsupported URL host", async () => {
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ type: "url", url: "https://example.com/video" }),
  });
  await resp.text();
  assertEquals(resp.status, 400);
});

Deno.test("text detection: known GPT-style sample scores as AI", async () => {
  const aiText =
    "It's important to note that navigating the intricate tapestry of modern technology " +
    "requires a multifaceted approach. Not only must we leverage robust frameworks, but we " +
    "must also delve into the nuanced realm of seamless integration. In conclusion, embracing " +
    "this paradigm will showcase the pivotal role of innovation in our vibrant landscape.";
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ type: "text", text: aiText }),
  });
  const body = await resp.json();
  assertEquals(resp.status, 200);
  assert(
    body.ai_probability >= 70,
    `expected >=70 AI probability, got ${body.ai_probability}`,
  );
});

Deno.test("text detection: casual human text scores as human", async () => {
  const humanText =
    "ok so yesterday i tried that new ramen spot on 4th and honestly... mid? broth was fine " +
    "but the egg was overcooked lol. my friend kept saying its overrated and tbh i think shes " +
    "right. gonna stick with the place near my apt, way better and cheaper too";
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ type: "text", text: humanText }),
  });
  const body = await resp.json();
  assertEquals(resp.status, 200);
  assert(
    body.ai_probability <= 45,
    `expected <=45 AI probability, got ${body.ai_probability}`,
  );
});

for (const fx of IMAGE_FIXTURES) {
  Deno.test(`image fixture: ${fx.name} (${fx.expected})`, async () => {
    let prepared: { dataUrl: string; mime: string };
    try {
      prepared = await fetchAsDataUrl(fx.url);
    } catch (e) {
      console.warn(`skipping ${fx.name}: ${(e as Error).message}`);
      return;
    }
    const result = await detectImage(prepared.dataUrl, prepared.mime);
    console.log(
      `[${fx.name}] prob=${result.ai_probability} verdict=${result.verdict} model=${result.likely_model}`,
    );
    if (fx.expected === "ai" && fx.minProbability !== undefined) {
      assert(
        result.ai_probability >= fx.minProbability,
        `${fx.name}: expected >=${fx.minProbability}, got ${result.ai_probability}`,
      );
    }
    if (fx.expected === "real" && fx.maxProbability !== undefined) {
      assert(
        result.ai_probability <= fx.maxProbability,
        `${fx.name}: expected <=${fx.maxProbability}, got ${result.ai_probability}`,
      );
    }
  });
}
