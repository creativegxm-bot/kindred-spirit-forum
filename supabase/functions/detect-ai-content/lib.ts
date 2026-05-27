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
