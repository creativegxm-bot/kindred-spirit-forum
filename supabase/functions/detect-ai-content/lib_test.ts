// Offline, deterministic tests for detect-ai-content.
//
// These tests run fully locally with no network and no credentials. They cover
// the pure logic in ./lib.ts using canned model responses, so they can be run
// as `deno test supabase/functions/detect-ai-content/lib_test.ts` without
// hitting the live edge function or the AI gateway.
//
// For end-to-end tests against the deployed function, see index_test.ts.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import {
  aggregateProbability,
  aggregateResults,
  clampProbability,
  deriveVerdict,
  extractYouTubeId,
  isKnownVideoHost,
  validateMediaDataUrl,
  type ModelResult,
} from "./lib.ts";

// ---------- Canned ("mocked") model responses ----------
// Shape mirrors what callModel() returns after parsing the AI gateway
// tool_call arguments. Tests use these instead of calling the gateway.

const aiImageStrong: ModelResult = {
  ai_probability: 92,
  verdict: "ai",
  confidence: "high",
  signals: ["poreless skin", "perfect symmetry", "no EXIF"],
  summary: "Clearly AI-generated portrait with diffusion fingerprints.",
  likely_model: "Midjourney v6",
  model_confidence: "high",
};

const aiImageConservative: ModelResult = {
  ai_probability: 68,
  verdict: "likely_ai",
  confidence: "medium",
  signals: ["too-even lighting", "flat color grade"],
  summary: "Several synthetic tells but not conclusive.",
  likely_model: "Stable Diffusion XL",
  model_confidence: "medium",
};

const realPhoto: ModelResult = {
  ai_probability: 12,
  verdict: "human",
  confidence: "high",
  signals: ["visible sensor grain", "real shadows", "JPEG artifacts"],
  summary: "Looks like a real camera photograph.",
  likely_model: "Unknown",
  model_confidence: "low",
};

const aiTextChatGPT: ModelResult = {
  ai_probability: 88,
  verdict: "ai",
  confidence: "high",
  signals: [
    '"It\'s important to note" cliche',
    "tricolon list of three",
    "moralizing conclusion",
  ],
  summary: "Classic GPT-4 family cadence and vocabulary.",
  likely_model: "ChatGPT",
  model_confidence: "high",
};

const aiTextClaude: ModelResult = {
  ai_probability: 81,
  verdict: "likely_ai",
  confidence: "medium",
  signals: ["balanced both-sides framing", '"I\'d be happy to" hedge'],
  summary: "Reads like Claude's measured prose.",
  likely_model: "Claude",
  model_confidence: "medium",
};

// ---------- clampProbability ----------

Deno.test("clampProbability bounds to [0,100] and rounds", () => {
  assertEquals(clampProbability(-5), 0);
  assertEquals(clampProbability(150), 100);
  assertEquals(clampProbability(42.4), 42);
  assertEquals(clampProbability(42.6), 43);
});

// ---------- deriveVerdict ----------

Deno.test("deriveVerdict maps probability to verdict buckets", () => {
  assertEquals(deriveVerdict(5), "human");
  assertEquals(deriveVerdict(14.9), "human");
  assertEquals(deriveVerdict(30), "likely_human");
  assertEquals(deriveVerdict(50), "uncertain");
  assertEquals(deriveVerdict(70), "likely_ai");
  assertEquals(deriveVerdict(85), "ai");
  assertEquals(deriveVerdict(100), "ai");
});

// ---------- aggregateProbability ----------

Deno.test("aggregateProbability text path averages probabilities", () => {
  assertEquals(aggregateProbability("text", [80, 40]), 60);
  assertEquals(aggregateProbability("text", [10, 20, 30]), 20);
});

Deno.test("aggregateProbability image path preserves very high hits", () => {
  // One model 92, one model 68, no lowHits -> shouldn't collapse to ~80 avg.
  const out = aggregateProbability("image", [92, 68]);
  assert(out >= 85, `expected very-high preservation, got ${out}`);
});

Deno.test("aggregateProbability image path weights max when one high hit", () => {
  // Both >= 70 puts us in the highHits branch: avg*0.3 + max*0.7.
  const out = aggregateProbability("image", [72, 70]);
  // avg=71, max=72 -> 71*0.3 + 72*0.7 = 71.7 -> 72
  assertEquals(out, 72);
});

Deno.test("aggregateProbability image path uses mixed weighting when no high hits", () => {
  // No probability >= 70, also no veryHigh: falls to avg*0.45 + max*0.55.
  const out = aggregateProbability("image", [40, 60]);
  // avg=50, max=60 -> 50*0.45 + 60*0.55 = 55.5 -> 56
  assertEquals(out, 56);
});

Deno.test("aggregateProbability image path does not preserve when a strong low hit exists", () => {
  // veryHigh + lowHits -> falls through to mixed weighting.
  const out = aggregateProbability("image", [92, 20]);
  // avg=56, max=92 -> 56*0.45 + 92*0.55 = 75.8 -> 76
  assertEquals(out, 76);
});

Deno.test("aggregateProbability video path mirrors image path", () => {
  assertEquals(
    aggregateProbability("video", [92, 68]),
    aggregateProbability("image", [92, 68]),
  );
});

// ---------- aggregateResults (end-to-end pure pipeline) ----------

Deno.test("aggregateResults image: strong + conservative collapses to AI verdict", () => {
  const out = aggregateResults("image", [aiImageStrong, aiImageConservative]);
  assertEquals(out.verdict, "ai");
  assert(out.ai_probability >= 85, `got ${out.ai_probability}`);
  // Strongest hit wins model attribution for image/video.
  assertEquals(out.likely_model, "Midjourney v6");
  // Signals deduped and merged.
  assert(out.signals.includes("poreless skin"));
  assert(out.signals.includes("too-even lighting"));
});

Deno.test("aggregateResults image: real photo stays in human/likely_human range", () => {
  const out = aggregateResults("image", [realPhoto, { ...realPhoto, ai_probability: 20 }]);
  assert(
    out.verdict === "human" || out.verdict === "likely_human",
    `expected human or likely_human, got ${out.verdict}`,
  );
  assert(out.ai_probability < 40, `expected <40, got ${out.ai_probability}`);
  // Both models agree (spread small) and high confidence -> high.
  assertEquals(out.confidence, "high");
  // No named model -> falls back to Unknown.
  assertEquals(out.likely_model, "Unknown");
});

Deno.test("aggregateResults text: averages and picks highest model_confidence for attribution", () => {
  const out = aggregateResults("text", [aiTextChatGPT, aiTextClaude]);
  // avg(88,81)=84.5 -> 85 -> 'ai'.
  assertEquals(out.ai_probability, 85);
  assertEquals(out.verdict, "ai");
  // ChatGPT has higher model_confidence -> wins.
  assertEquals(out.likely_model, "ChatGPT");
});

Deno.test("aggregateResults confidence downgrades when models disagree", () => {
  const out = aggregateResults("image", [aiImageStrong, realPhoto]);
  // Spread = 80 -> low confidence.
  assertEquals(out.confidence, "low");
});

Deno.test("aggregateResults dedupes signals case-insensitively and caps at 8", () => {
  const noisy: ModelResult = {
    ai_probability: 80,
    confidence: "high",
    signals: ["A", "a", "B", "b", "C", "D", "E", "F", "G", "H", "I"],
    summary: "x",
    likely_model: "Test",
    model_confidence: "high",
  };
  const out = aggregateResults("text", [noisy]);
  assertEquals(out.signals.length, 8);
  // Lowercase duplicate shouldn't appear twice.
  assertEquals(out.signals.filter((s) => s.toLowerCase() === "a").length, 1);
});

// ---------- URL helpers ----------

Deno.test("extractYouTubeId handles common URL shapes", () => {
  assertEquals(
    extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "dQw4w9WgXcQ",
  );
  assertEquals(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assertEquals(
    extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ",
  );
  assertEquals(extractYouTubeId("https://example.com/nope"), null);
});

Deno.test("isKnownVideoHost accepts supported platforms", () => {
  for (
    const url of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://vimeo.com/12345",
      "https://www.tiktok.com/@user/video/123",
      "https://twitter.com/user/status/1",
      "https://x.com/user/status/1",
      "https://www.instagram.com/reel/abc/",
      "https://fb.watch/abc/",
    ]
  ) {
    assert(isKnownVideoHost(url), `should accept ${url}`);
  }
});

Deno.test("isKnownVideoHost rejects unrelated hosts", () => {
  for (const url of ["https://example.com/video", "https://medium.com/post"]) {
    assert(!isKnownVideoHost(url), `should reject ${url}`);
  }
});

// ---------- validateMediaDataUrl: corrupted / partial upload paths ----------

function dataUrl(mime: string, bytes: Uint8Array): string {
  return `data:${mime};base64,${encodeBase64(bytes)}`;
}

// Minimal valid MP4 head: ftyp box at offset 4 + padding to clear the 1KB floor.
function fakeMp4(extraBytes = 2048): Uint8Array {
  const head = new Uint8Array([
    0x00, 0x00, 0x00, 0x20,
    0x66, 0x74, 0x79, 0x70, // 'ftyp'
    0x69, 0x73, 0x6f, 0x6d,
    0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32, 0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31,
  ]);
  const out = new Uint8Array(head.length + extraBytes);
  out.set(head, 0);
  return out;
}

function fakeWebm(extraBytes = 2048): Uint8Array {
  const head = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);
  const out = new Uint8Array(head.length + extraBytes);
  out.set(head, 0);
  return out;
}

function fakeJpeg(extraBytes = 256): Uint8Array {
  const head = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  const out = new Uint8Array(head.length + extraBytes);
  out.set(head, 0);
  return out;
}

Deno.test("validateMediaDataUrl rejects missing payload", () => {
  const r = validateMediaDataUrl("video", undefined);
  assert(!r.ok && /Missing file data/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects non-data-URL strings", () => {
  const r = validateMediaDataUrl("video", "https://example.com/clip.mp4", "video/mp4");
  assert(!r.ok && /valid data URL/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects non-base64 data URLs", () => {
  const r = validateMediaDataUrl("image", "data:image/png,hello", "image/png");
  assert(!r.ok && /base64/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects empty base64 payload (aborted upload)", () => {
  const r = validateMediaDataUrl("video", "data:video/mp4;base64,", "video/mp4");
  assert(!r.ok && /empty|interrupted/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects corrupted base64 (illegal chars)", () => {
  const r = validateMediaDataUrl("video", "data:video/mp4;base64,!!!not-base64!!!", "video/mp4");
  assert(!r.ok && /corrupted/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects truncated MP4 (under size floor)", () => {
  const r = validateMediaDataUrl("video", dataUrl("video/mp4", fakeMp4(0)), "video/mp4");
  assert(!r.ok && /too small|incomplete|corrupted/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects MP4 missing the ftyp header", () => {
  const garbage = new Uint8Array(2048);
  const r = validateMediaDataUrl("video", dataUrl("video/mp4", garbage), "video/mp4");
  assert(!r.ok && /MP4 header|corrupted|truncated/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects WebM missing the EBML header", () => {
  const garbage = new Uint8Array(2048);
  const r = validateMediaDataUrl("video", dataUrl("video/webm", garbage), "video/webm");
  assert(!r.ok && /WebM header|corrupted|truncated/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects image masquerading as video", () => {
  const r = validateMediaDataUrl(
    "video",
    dataUrl("application/octet-stream", fakeJpeg(2048)),
    "application/octet-stream",
  );
  assert(!r.ok && /image, not a video/i.test(r.error));
});

Deno.test("validateMediaDataUrl accepts a plausible MP4 payload", () => {
  const r = validateMediaDataUrl("video", dataUrl("video/mp4", fakeMp4()), "video/mp4");
  assert(r.ok, `expected ok, got ${(r as { error?: string }).error ?? "??"}`);
});

Deno.test("validateMediaDataUrl accepts a plausible WebM payload", () => {
  const r = validateMediaDataUrl("video", dataUrl("video/webm", fakeWebm()), "video/webm");
  assert(r.ok);
});

Deno.test("validateMediaDataUrl rejects truncated image (under size floor)", () => {
  const tiny = new Uint8Array([0xff, 0xd8, 0xff]);
  const r = validateMediaDataUrl("image", dataUrl("image/jpeg", tiny), "image/jpeg");
  assert(!r.ok && /too small|incomplete|corrupted/i.test(r.error));
});

Deno.test("validateMediaDataUrl rejects PNG with wrong magic bytes", () => {
  const garbage = new Uint8Array(512);
  const r = validateMediaDataUrl("image", dataUrl("image/png", garbage), "image/png");
  assert(!r.ok && /bad header|corrupted|truncated/i.test(r.error));
});

Deno.test("validateMediaDataUrl accepts a plausible JPEG payload", () => {
  const r = validateMediaDataUrl("image", dataUrl("image/jpeg", fakeJpeg()), "image/jpeg");
  assert(r.ok);
});

