// Test fixtures for detect-ai-content regression tests.
// Images are checked into the repo under ./fixtures/ so tests are
// deterministic and do not depend on external hosts or asset changes.

export interface ImageFixture {
  name: string;
  // Path relative to this file's directory.
  file: string;
  mime: string;
  expected: "ai" | "real";
  // For "ai": ai_probability must be >= minProbability.
  // For "real": ai_probability must be <= maxProbability.
  minProbability?: number;
  maxProbability?: number;
  notes?: string;
}

export const IMAGE_FIXTURES: ImageFixture[] = [
  // --- AI-generated samples ---
  {
    name: "tpdne-stylegan-portrait",
    file: "fixtures/tpdne.jpg",
    mime: "image/jpeg",
    expected: "ai",
    minProbability: 65,
    notes: "Cached StyleGAN portrait from thispersondoesnotexist (resized 512px).",
  },
  {
    name: "diffusion-fantasy-landscape",
    file: "fixtures/ai_landscape.jpg",
    mime: "image/jpeg",
    expected: "ai",
    minProbability: 60,
    notes: "Locally generated diffusion-model landscape, obviously synthetic.",
  },

  // --- Real photographs / non-AI ---
  {
    name: "nasa-iss-photo",
    file: "fixtures/nasa.jpg",
    mime: "image/jpeg",
    expected: "real",
    maxProbability: 45,
    notes: "Cached NASA ISS photograph (public domain).",
  },
  {
    name: "wikimedia-png-demo",
    file: "fixtures/wikimedia.png",
    mime: "image/png",
    expected: "real",
    maxProbability: 60,
    notes: "Cached Wikimedia PNG transparency demo (lenient — borderline rendering).",
  },
];

export interface VideoFixture {
  name: string;
  file: string;
  mime: string;
  // Inclusive bounds the response's ai_probability must fall within.
  minProbability: number;
  maxProbability: number;
  notes?: string;
}

// All current video fixtures are synthetic ffmpeg test-card clips. They should
// reliably score LOW (non-AI) — the model has nothing AI-looking to latch onto.
// Bounds are tightened from the trivial [0,100] so CI catches regressions where
// the function starts emitting non-finite values, NaN, or wildly miscalibrated
// scores on plain test patterns.
export const VIDEO_FIXTURES: VideoFixture[] = [
  {
    name: "ffmpeg-testsrc-pattern",
    file: "fixtures/sample_video.mp4",
    mime: "video/mp4",
    minProbability: 0,
    maxProbability: 50,
    notes: "2s 320x240 ffmpeg testsrc clip used to exercise the video code path.",
  },
  {
    name: "h264-landscape-16x9",
    file: "fixtures/h264_landscape_16x9.mp4",
    mime: "video/mp4",
    minProbability: 0,
    maxProbability: 50,
    notes: "H.264/AVC MP4, 640x360 landscape — common YouTube/social aspect ratio.",
  },
  {
    name: "h264-portrait-9x16",
    file: "fixtures/h264_portrait_9x16.mp4",
    mime: "video/mp4",
    minProbability: 0,
    maxProbability: 50,
    notes: "H.264/AVC MP4, 360x640 vertical — TikTok/Reels/Shorts aspect ratio.",
  },
  {
    name: "h264-square-1x1",
    file: "fixtures/h264_square_1x1.mp4",
    mime: "video/mp4",
    minProbability: 0,
    maxProbability: 50,
    notes: "H.264/AVC MP4, 480x480 square — Instagram feed aspect ratio.",
  },
  {
    name: "vp9-webm-landscape",
    file: "fixtures/vp9_landscape_16x9.webm",
    mime: "video/webm",
    minProbability: 0,
    maxProbability: 50,
    notes: "VP9 WebM, 640x360 — exercises the WebM/EBML decode path and non-MP4 codec.",
  },
];

export interface UrlRejectionFixture {
  name: string;
  url: string;
  notes?: string;
}

export const UNSUPPORTED_URL_FIXTURES: UrlRejectionFixture[] = [
  { name: "non-video-host", url: "https://example.com/video" },
  { name: "youtube-playlist", url: "https://www.youtube.com/playlist?list=PL12345" },
];

