// Pure, dependency-free helpers for detect-ai-content.
// Extracted from index.ts so they can be unit-tested locally without spinning
// up the edge runtime or hitting the live AI gateway.

export type DetectKind = "text" | "image" | "video" | "url";

export interface ModelResult {
  ai_probability: number;
  verdict?: string;
  confidence?: "low" | "medium" | "high";
  signals?: string[];
  summary?: string;
  likely_model?: string;
  model_confidence?: "low" | "medium" | "high";
}

export interface AggregatedResponse {
  ai_probability: number;
  verdict: "human" | "likely_human" | "uncertain" | "likely_ai" | "ai";
  confidence: "low" | "medium" | "high";
  signals: string[];
  summary: string;
  likely_model: string;
  model_confidence: "low" | "medium" | "high";
}

// ---------- Media payload validation ----------
// Catches corrupted / partially-uploaded image and video data URLs before we
// burn an AI-gateway call on them. Pure and dependency-free so it can be unit
// tested without the edge runtime.

export interface MediaValidationOk { ok: true; bytes: number }
export interface MediaValidationError { ok: false; error: string }
export type MediaValidationResult = MediaValidationOk | MediaValidationError;

// Minimum plausible payload sizes. A real MP4 is many KB even for a 1s clip;
// anything under 1KB is almost certainly a truncated/aborted upload.
const MIN_VIDEO_BYTES = 1024;
const MIN_IMAGE_BYTES = 128;

function decodeBase64Length(b64: string): number | null {
  // Validate base64 charset + padding cheaply, then compute decoded length.
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) return null;
  if (b64.length % 4 !== 0) return null;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return (b64.length / 4) * 3 - padding;
}

function decodeBase64Head(b64: string, n: number): Uint8Array | null {
  try {
    // Decode just enough characters to get the first `n` bytes (4 chars -> 3 bytes).
    const chunk = b64.slice(0, Math.ceil((n * 4) / 3) + 4);
    const bin = atob(chunk.replace(/=+$/, "").padEnd(Math.ceil(chunk.length / 4) * 4, "="));
    const out = new Uint8Array(Math.min(n, bin.length));
    for (let i = 0; i < out.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function hasMp4FtypBox(head: Uint8Array): boolean {
  // ISO BMFF: bytes 4..8 should be ASCII "ftyp".
  return head.length >= 8 &&
    head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70;
}

function hasWebmHeader(head: Uint8Array): boolean {
  // EBML magic: 1A 45 DF A3.
  return head.length >= 4 &&
    head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3;
}

function hasImageMagic(head: Uint8Array, mime: string): boolean {
  if (head.length < 4) return false;
  const m = mime.toLowerCase();
  if (m.includes("jpeg") || m.includes("jpg")) {
    return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  }
  if (m.includes("png")) {
    return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  }
  if (m.includes("gif")) {
    return head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46;
  }
  if (m.includes("webp")) {
    return head.length >= 12 &&
      head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
      head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
  }
  // Unknown image subtype — don't block on magic alone.
  return true;
}

/**
 * Validate an inline media payload (image or video) supplied as a base64 data URL.
 * Returns a structured result; callers translate `error` into a 400 response.
 */
export function validateMediaDataUrl(
  type: "image" | "video",
  fileDataUrl: string | undefined | null,
  fileMimeType?: string,
): MediaValidationResult {
  if (!fileDataUrl || typeof fileDataUrl !== "string") {
    return { ok: false, error: "Missing file data." };
  }
  const match = fileDataUrl.match(/^data:([^;,]+)?(;[^,]*)?,(.*)$/s);
  if (!match) {
    return { ok: false, error: "File data is not a valid data URL." };
  }
  const headerMime = (match[1] ?? "").trim();
  const params = match[2] ?? "";
  const payload = match[3] ?? "";
  if (!/;base64/i.test(params)) {
    return { ok: false, error: "File data must be base64-encoded." };
  }
  if (payload.length === 0) {
    return { ok: false, error: "File data is empty — the upload may have been interrupted." };
  }
  const decodedLen = decodeBase64Length(payload);
  if (decodedLen === null) {
    return { ok: false, error: "File data is corrupted (invalid base64 encoding)." };
  }
  const mime = (fileMimeType || headerMime || "").toLowerCase();
  const minBytes = type === "video" ? MIN_VIDEO_BYTES : MIN_IMAGE_BYTES;
  if (decodedLen < minBytes) {
    return {
      ok: false,
      error: `${type === "video" ? "Video" : "Image"} file is too small (${decodedLen} bytes) — the upload appears to be incomplete or corrupted.`,
    };
  }
  const head = decodeBase64Head(payload, 16);
  if (!head) {
    return { ok: false, error: "File data is corrupted (could not decode header)." };
  }
  if (type === "video") {
    const looksLikeMp4 = mime.includes("mp4") || mime.includes("quicktime") || mime.includes("m4v");
    const looksLikeWebm = mime.includes("webm") || mime.includes("matroska");
    if (looksLikeMp4 && !hasMp4FtypBox(head)) {
      return { ok: false, error: "Video file is corrupted or truncated (missing MP4 header)." };
    }
    if (looksLikeWebm && !hasWebmHeader(head)) {
      return { ok: false, error: "Video file is corrupted or truncated (missing WebM header)." };
    }
    // Unknown video subtype: at least make sure it isn't obviously an image.
    if (hasImageMagic(head, "image/jpeg") || hasImageMagic(head, "image/png")) {
      return { ok: false, error: "File looks like an image, not a video." };
    }
  } else if (type === "image" && mime.startsWith("image/")) {
    if (!hasImageMagic(head, mime)) {
      return { ok: false, error: "Image file is corrupted or truncated (bad header)." };
    }
  }
  return { ok: true, bytes: decodedLen };
}

export const YT_HOST_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//i;
const YT_ID_REGEXES: RegExp[] = [
  /[?&]v=([A-Za-z0-9_-]{11})/,
  /\/shorts\/([A-Za-z0-9_-]{11})/,
  /\/embed\/([A-Za-z0-9_-]{11})/,
  /\/live\/([A-Za-z0-9_-]{11})/,
  /\/v\/([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
];
export const YT_PLAYLIST_REGEX = /[?&]list=([A-Za-z0-9_-]+)/;

export function extractYouTubeId(u: string): string | null {
  for (const re of YT_ID_REGEXES) {
    const m = u.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function isKnownVideoHost(u: string): boolean {
  return (
    YT_HOST_REGEX.test(u) ||
    /^(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\//i.test(u) ||
    /^(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com\//i.test(u) ||
    /^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter|x)\.com\//i.test(u) ||
    /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\//i.test(u) ||
    /^(?:https?:\/\/)?(?:www\.|web\.)?facebook\.com\/.+\/videos?\//i.test(u) ||
    /^(?:https?:\/\/)?fb\.watch\//i.test(u)
  );
}

export function deriveVerdict(
  p: number,
): "human" | "likely_human" | "uncertain" | "likely_ai" | "ai" {
  if (p < 15) return "human";
  if (p < 40) return "likely_human";
  if (p < 60) return "uncertain";
  if (p < 85) return "likely_ai";
  return "ai";
}

export function clampProbability(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function aggregateProbability(kind: DetectKind, probabilities: number[]): number {
  if (probabilities.length === 0) return 0;
  const avg = probabilities.reduce((sum, p) => sum + p, 0) / probabilities.length;

  if (kind === "image" || kind === "video") {
    const max = Math.max(...probabilities);
    const min = Math.min(...probabilities);
    const spread = max - min;
    const highHits = probabilities.filter((p) => p >= 70).length;
    const veryHighHits = probabilities.filter((p) => p >= 85).length;
    const lowHits = probabilities.filter((p) => p <= 35).length;

    if (veryHighHits >= 1 && lowHits === 0) {
      return clampProbability(max - spread * 0.15);
    }
    if (highHits >= 1 && lowHits === 0) {
      return clampProbability(avg * 0.3 + max * 0.7);
    }
    return clampProbability(avg * 0.45 + max * 0.55);
  }

  return clampProbability(avg);
}

/**
 * Aggregate multiple model results into the final response shape.
 * Pure — no network, no globals. Used by both the live edge function and tests.
 */
export function aggregateResults(
  kind: DetectKind,
  results: ModelResult[],
): AggregatedResponse {
  if (results.length === 0) throw new Error("aggregateResults: empty results");

  const confRank: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const probs = results.map((r) => Number(r.ai_probability) || 0);
  const ai_probability = aggregateProbability(kind, probs);

  const allSignals: string[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    for (const s of (r.signals ?? []) as string[]) {
      const key = s.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        allSignals.push(s);
      }
    }
  }

  const named = results.filter((r) => r.likely_model && !/unknown/i.test(r.likely_model));
  const pickFrom = (named.length ? named : results).slice();
  pickFrom.sort((a, b) => {
    if (kind === "image" || kind === "video") {
      return (Number(b.ai_probability) || 0) - (Number(a.ai_probability) || 0);
    }
    return (confRank[b.model_confidence ?? "low"] ?? 0) -
      (confRank[a.model_confidence ?? "low"] ?? 0);
  });
  const best = pickFrom[0];

  const spread = Math.max(...probs) - Math.min(...probs);
  const avgConf =
    results.reduce((s, r) => s + (confRank[r.confidence ?? "medium"] ?? 2), 0) / results.length;
  let confidence: "low" | "medium" | "high";
  if (spread > 30) confidence = "low";
  else if (spread <= 12 && avgConf >= 2.5) confidence = "high";
  else confidence = "medium";

  return {
    ai_probability,
    verdict: deriveVerdict(ai_probability),
    confidence,
    signals: allSignals.slice(0, 8),
    summary: best.summary ?? "",
    likely_model: best.likely_model ?? "Unknown",
    model_confidence: best.model_confidence ?? "low",
  };
}
