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
