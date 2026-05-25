// Test fixtures for detect-ai-content regression tests.
// Each fixture is a publicly reachable image with a known origin so we can
// assert calibration without storing large binaries in the repo.

export interface ImageFixture {
  name: string;
  url: string;
  expected: "ai" | "real";
  // Probability thresholds the ensemble must satisfy.
  // For "ai": ai_probability must be >= minProbability.
  // For "real": ai_probability must be <= maxProbability.
  minProbability?: number;
  maxProbability?: number;
  notes?: string;
}

export const IMAGE_FIXTURES: ImageFixture[] = [
  // --- AI-generated samples ---
  {
    name: "thispersondoesnotexist-stylegan",
    url: "https://thispersondoesnotexist.com/",
    expected: "ai",
    minProbability: 65,
    notes: "StyleGAN portrait; classic flawless skin + symmetric features.",
  },
  {
    name: "sdxl-sample-huggingface",
    url: "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_offset_example-000001.png",
    expected: "ai",
    minProbability: 60,
    notes: "Official SDXL sample image.",
  },

  // --- Real photographs ---
  {
    name: "nasa-earth-photo",
    url: "https://images-assets.nasa.gov/image/iss040e090540/iss040e090540~small.jpg",
    expected: "real",
    maxProbability: 45,
    notes: "Real NASA ISS photograph with sensor grain and natural lighting.",
  },
  {
    name: "wikimedia-street-photo",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/640px-PNG_transparency_demonstration_1.png",
    expected: "real",
    maxProbability: 60,
    notes: "Wikimedia commons rendered demo (lenient threshold — borderline).",
  },
];
