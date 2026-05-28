// Integration tests for detect-ai-content.
// Hits the deployed edge function with known fixtures and asserts the
// calibration thresholds we care about. Run with the edge-function test tool.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { IMAGE_FIXTURES, VIDEO_FIXTURES } from "./fixtures.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY =
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  Deno.env.get("SUPABASE_ANON_KEY")!;

const FN_URL = `${SUPABASE_URL}/functions/v1/detect-ai-content`;

async function loadFixtureAsDataUrl(
  file: string,
  mime: string,
): Promise<{ dataUrl: string; mime: string }> {
  const path = new URL(`./${file}`, import.meta.url);
  const bytes = await Deno.readFile(path);
  return { dataUrl: `data:${mime};base64,${encodeBase64(bytes)}`, mime };
}

interface DetectResult {
  ai_probability: number;
  verdict: string;
  confidence: string;
  signals: string[];
  summary: string;
  likely_model: string;
}

async function detectMedia(
  type: "image" | "video",
  dataUrl: string,
  mime: string,
): Promise<DetectResult> {
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ type, fileDataUrl: dataUrl, fileMimeType: mime }),
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`detect ${resp.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as DetectResult;
}

const detectImage = (dataUrl: string, mime: string) => detectMedia("image", dataUrl, mime);
const detectVideo = (dataUrl: string, mime: string) => detectMedia("video", dataUrl, mime);

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
    const prepared = await loadFixtureAsDataUrl(fx.file, fx.mime);
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

for (const fx of VIDEO_FIXTURES) {
  Deno.test(`video fixture: ${fx.name}`, async () => {
    const prepared = await loadFixtureAsDataUrl(fx.file, fx.mime);
    const result = await detectVideo(prepared.dataUrl, prepared.mime);
    console.log(
      `[video:${fx.name}] prob=${result.ai_probability} verdict=${result.verdict} model=${result.likely_model}`,
    );
    assert(typeof result.ai_probability === "number", "ai_probability must be a number");
    assert(Number.isFinite(result.ai_probability), "ai_probability must be finite");
    assert(
      result.ai_probability >= fx.minProbability && result.ai_probability <= fx.maxProbability,
      `${fx.name}: expected ai_probability in [${fx.minProbability}, ${fx.maxProbability}], got ${result.ai_probability}`,
    );
    assert(typeof result.verdict === "string" && result.verdict.length > 0, "verdict must be non-empty");
    assert(typeof result.confidence === "string" && result.confidence.length > 0, "confidence must be non-empty");
    assert(Array.isArray(result.signals), "signals must be an array");
    assert(typeof result.summary === "string", "summary must be a string");
  });
}

Deno.test("video without fileDataUrl is rejected", async () => {
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ type: "video" }),
  });
  await resp.text();
  assertEquals(resp.status, 400);
});

// ---- Corrupted / partial video upload integration tests ----

async function postVideo(payload: Record<string, unknown>): Promise<{ status: number; body: any }> {
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify(payload),
  });
  const text = await resp.text();
  let body: any = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: resp.status, body };
}

Deno.test("video with empty base64 payload returns clear 400", async () => {
  const { status, body } = await postVideo({
    type: "video",
    fileDataUrl: "data:video/mp4;base64,",
    fileMimeType: "video/mp4",
  });
  assertEquals(status, 400);
  assert(typeof body?.error === "string" && body.error.length > 0, "error message must be non-empty");
  assert(/empty|interrupted|corrupt/i.test(body.error), `unexpected error: ${body.error}`);
});

Deno.test("video with truncated MP4 (head-only) returns clear 400", async () => {
  // First 16 bytes of an MP4 ftyp box only — far below any real clip.
  const truncated = new Uint8Array([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
    0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
  ]);
  const b64 = encodeBase64(truncated);
  const { status, body } = await postVideo({
    type: "video",
    fileDataUrl: `data:video/mp4;base64,${b64}`,
    fileMimeType: "video/mp4",
  });
  assertEquals(status, 400);
  assert(/too small|incomplete|corrupt|truncat/i.test(body?.error ?? ""), `unexpected error: ${body?.error}`);
});

Deno.test("video with corrupted base64 payload returns clear 400", async () => {
  const { status, body } = await postVideo({
    type: "video",
    fileDataUrl: "data:video/mp4;base64,!!!definitely-not-base64!!!",
    fileMimeType: "video/mp4",
  });
  assertEquals(status, 400);
  assert(/corrupt|base64/i.test(body?.error ?? ""), `unexpected error: ${body?.error}`);
});

Deno.test("video labelled mp4 but missing ftyp header returns clear 400", async () => {
  // 2KB of zeros — passes the size floor but fails the MP4 magic check.
  const garbage = new Uint8Array(2048);
  const b64 = encodeBase64(garbage);
  const { status, body } = await postVideo({
    type: "video",
    fileDataUrl: `data:video/mp4;base64,${b64}`,
    fileMimeType: "video/mp4",
  });
  assertEquals(status, 400);
  assert(/MP4 header|corrupt|truncat/i.test(body?.error ?? ""), `unexpected error: ${body?.error}`);
});

