export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string; // rendered as paragraphs (split on blank lines)
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-ai-content-detectors-work",
    title: "How AI Content Detectors Actually Work",
    excerpt:
      "A plain-English look at the signals — perplexity, burstiness, diffusion artifacts — that tell AI-generated content apart from human work.",
    date: "2026-05-02",
    readTime: "7 min read",
    content: `AI detectors don't read meaning the way you do. Instead, they measure statistical fingerprints that large language models and diffusion image generators leave behind. For text, the two most useful metrics are perplexity (how "surprising" each word is to a reference model) and burstiness (how much sentence length and complexity vary). Human writing tends to be bursty and locally unpredictable; LLM output is smooth, uniform, and statistically average.

For images, detectors look at frequency-domain artifacts left by the upsampling layers in diffusion models, unnatural symmetry, missing micro-noise, and well-known anatomy failures (hands, ears, jewelry, text). For video, the same checks run frame by frame, plus temporal-consistency tests: does the lighting actually behave like physical lighting between frames, or does it drift in ways only an interpolator would produce?

No single signal is conclusive. A good detector combines many of them and outputs a probability, not a yes/no — which is exactly why our verdicts come with a confidence level and a list of the specific signals we found.`,
  },
  {
    slug: "spot-ai-generated-images",
    title: "7 Quick Ways to Spot an AI-Generated Image",
    excerpt:
      "Hands, hair, jewelry, shadows, text, symmetry, and that uncanny skin: the giveaways your eyes can catch before any tool runs.",
    date: "2026-04-25",
    readTime: "5 min read",
    content: `Even today's best image generators leak tells if you know where to look. Start with hands: count fingers, check that knuckles bend the right way, and look for fused or missing digits. Hair next — strands that fade into skin, halos around the head, or hair that "melts" into the background are classic diffusion artifacts.

Check small repeating objects: teeth, jewelry, eyelashes, watch faces, and earrings often show asymmetric duplication. Read any text in the image — generators still struggle with letters, especially on signs, packaging, and clothing. Look at shadows: are they all coming from the same light source and falling in physically plausible directions?

Finally, the skin test. AI skin tends to look airbrushed and "too clean," with uniform pores and no real micro-texture. Zoom in. If a portrait holds up perfectly at 200% but the background blurs into mush, you're probably looking at a generated image.`,
  },
  {
    slug: "detecting-ai-text-chatgpt-claude-gemini",
    title: "Detecting AI-Written Text from ChatGPT, Claude and Gemini",
    excerpt:
      "Each major model has stylistic tics. Here's what to look for — and why short, edited text is the hardest case.",
    date: "2026-04-17",
    readTime: "6 min read",
    content: `Modern LLMs share a common voice: balanced sentence length, polite hedging, "it's important to note that…" framing, tidy three-item lists, and a preference for transitional words like "moreover," "furthermore," and "in conclusion." When every paragraph opens with a topic sentence and ends with a neat summary, that's a flag.

Specific tics differ. ChatGPT loves bullet lists and the construction "not just X, but Y." Claude tends toward longer, more careful paragraphs and frequent caveats. Gemini often produces clean, encyclopedia-flavored prose that reads like a polished Wikipedia summary. None of these are proof on their own — many human writers do the same things — but together they shift the probability.

Two things make detection genuinely hard. First, short text (under ~150 words) doesn't give enough signal for any detector to be confident. Second, a human editing pass — rewriting one sentence in three, adding a typo, breaking up a list — collapses the statistical fingerprint quickly. That's why a responsible detector reports uncertainty instead of pretending to be sure.`,
  },
  {
    slug: "deepfake-video-detection-guide",
    title: "Deepfake Video Detection: What to Look For in 2026",
    excerpt:
      "Eye blinks, edge flicker, audio drift, and the new generation of fully synthetic videos from Sora-class models.",
    date: "2026-04-09",
    readTime: "6 min read",
    content: `Early deepfakes were easy: people barely blinked, jawlines wobbled, and the seam where the face was swapped onto the body shimmered. Most of those tells are gone in 2026. The new failure modes are subtler.

Watch the edges of the head against the background — even great models still produce a faint flicker where hair meets sky or hair meets a busy scene. Check teeth and inner mouth across frames; they often morph slightly as the person speaks. Listen separately to the audio: does the breathing match the chest movement? Are the room acoustics consistent with the visible space?

Fully synthetic videos (no real source footage) bring a new class of artifacts: physics that almost works (water that ripples but never splashes correctly), text on signs that subtly changes between frames, and crowd extras whose faces drift between cuts. When in doubt, scrub the timeline frame by frame at the moments of fastest motion — that's where interpolation models break down first.`,
  },
  {
    slug: "limits-of-ai-detection",
    title: "The Honest Limits of AI Detection",
    excerpt:
      "Why no detector is 100% accurate, what false positives really cost, and how to use probability scores responsibly.",
    date: "2026-03-30",
    readTime: "5 min read",
    content: `Any tool that claims 100% accuracy on AI-generated content is misleading you. Detection is a probabilistic problem against a moving target — the models that generate content are improving every month, and the ones that detect it have to chase. The right question is never "is this AI?" but "how confident are we, and on what evidence?"

False positives matter more than people think. A student's essay flagged as AI when it isn't can derail a grade. A photographer's real photo flagged as synthetic can cost a job. That's why our detector returns a probability, a confidence level, and an explicit list of signals — so a human can weigh the evidence instead of trusting a binary verdict.

Best practice: treat detector output as one data point. Combine it with provenance (where did this come from? who shared it first?), context (does the claim make sense?), and, when stakes are high, a second tool or a human reviewer. AI detection is a flashlight, not a polygraph.`,
  },
  {
    slug: "protecting-yourself-from-ai-scams",
    title: "Protecting Yourself from AI-Powered Scams",
    excerpt:
      "Voice cloning, fake video calls, and AI-written phishing are now mainstream. Practical defenses you can adopt today.",
    date: "2026-03-22",
    readTime: "6 min read",
    content: `In 2026, AI-powered scams have moved from novelty to baseline threat. A cloned voice now needs about 10 seconds of source audio. Real-time face-swap video calls are commercially available. Phishing emails are grammatically perfect and personalized at scale. Old advice ("look for typos") doesn't help anymore.

Adopt three habits. First, agree on a private code word with family members for emergency phone calls — if "Mom" calls asking for money, the code word is the test. Second, never act on a single-channel request: if a video call asks you to wire money or change banking details, verify on a different channel you initiated yourself. Third, slow everything down. Real urgency rarely hits all at once; manufactured urgency is the scammer's main tool.

Run any suspicious image, video clip, or message through a detector before you act. A 30-second check is cheap; the alternative is not.`,
  },
];
