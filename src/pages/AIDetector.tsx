import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Sparkles, FileText, Image as ImageIcon, Video, ShieldCheck, AlertTriangle, Share2, Check, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import MortgageCalculatorBanner from "@/components/MortgageCalculatorBanner";
import ShopBanner from "@/components/ShopBanner";
import EngagementToolsGrid from "@/components/EngagementToolsGrid";
import UseCases from "@/components/UseCases";
import StatsBar from "@/components/StatsBar";
import SampleTexts from "@/components/SampleTexts";
import SavedResults, { saveEntry } from "@/components/SavedResults";
import EmailSignupBanner from "@/components/EmailSignupBanner";
import DetectorFAQ from "@/components/DetectorFAQ";
import sampleReal from "@/assets/sample-real.jpg";
import sampleAi from "@/assets/sample-ai.jpg";

type Result = {
  ai_probability: number;
  verdict: "human" | "likely_human" | "uncertain" | "likely_ai" | "ai";
  confidence: "low" | "medium" | "high";
  signals: string[];
  summary: string;
  likely_model?: string;
  model_confidence?: "low" | "medium" | "high";
};

const verdictMeta: Record<Result["verdict"], { label: string; className: string }> = {
  human: { label: "Human-written", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  likely_human: { label: "Likely human", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  uncertain: { label: "Uncertain", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  likely_ai: { label: "Likely AI", className: "bg-orange-500/15 text-orange-500 border-orange-500/30" },
  ai: { label: "AI-generated", className: "bg-red-500/15 text-red-500 border-red-500/30" },
};

const MAX_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO = 20 * 1024 * 1024; // 20MB (base64 inline limit)

const fileToDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const AIDetector = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"text" | "image" | "video" | "url">("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    const isVideo = f.type.startsWith("video/");
    const limit = isVideo ? MAX_VIDEO : MAX_IMAGE;
    if (f.size > limit) {
      toast({
        title: "File too large",
        description: `Max ${isVideo ? "20MB" : "10MB"}.`,
        variant: "destructive",
      });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    setShareUrl(null);
    try {
      let payload: Record<string, unknown> = { type: tab };
      if (tab === "text") {
        if (text.trim().length < 20) {
          toast({ title: "Text too short", description: "Paste at least 20 characters.", variant: "destructive" });
          setLoading(false);
          return;
        }
        payload.text = text;
      } else if (tab === "url") {
        if (!/^https?:\/\/.+/i.test(url.trim())) {
          toast({ title: "Invalid URL", description: "Paste a YouTube, Vimeo, TikTok or X video link.", variant: "destructive" });
          setLoading(false);
          return;
        }
        payload.url = url.trim();
      } else {
        if (!file) {
          toast({ title: "No file selected", variant: "destructive" });
          setLoading(false);
          return;
        }
        payload.fileDataUrl = await fileToDataUrl(file);
        payload.fileMimeType = file.type;
      }

      const { data, error } = await supabase.functions.invoke("detect-ai-content", { body: payload });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const r = data as Result;
      setResult(r);

      // Persist + upload preview for shareable URL
      let previewPublicUrl: string | null = null;
      if (file && tab !== "text") {
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const path = `shares/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("post-media").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (!upErr) {
          previewPublicUrl = supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl;
        }
      }

      const { data: inserted, error: insErr } = await supabase
        .from("detection_results")
        .insert({
          kind: tab,
          ai_probability: r.ai_probability,
          verdict: r.verdict,
          confidence: r.confidence,
          signals: r.signals,
          summary: r.summary,
          text_snippet: tab === "text" ? text.slice(0, 2000) : tab === "url" ? url.slice(0, 500) : null,
          preview_url: previewPublicUrl,
        })
        .select("id")
        .single();
      if (!insErr && inserted) {
        const shareEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-result/${inserted.id}`;
        setShareUrl(shareEndpoint);
        saveEntry({
          id: inserted.id,
          kind: tab,
          ai_probability: r.ai_probability,
          verdict: r.verdict,
          confidence: r.confidence,
          summary: r.summary,
          snippet: tab === "text" ? text.slice(0, 200) : tab === "url" ? url.slice(0, 200) : null,
          preview_url: previewPublicUrl,
          created_at: Date.now(),
        });
      }
    } catch (e: any) {
      toast({
        title: "Analysis failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "AI Detection Result", url: shareUrl });
        return;
      }
    } catch { /* fallthrough to clipboard */ }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Share URL is on your clipboard." });
    } catch {
      toast({ title: "Could not copy", description: shareUrl, variant: "destructive" });
    }
  };

  const reset = () => {
    setText("");
    setUrl("");
    setFile(null);
    setPreview(null);
    setResult(null);
    setShareUrl(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Content Detector – Spot AI-Written Text, Images & Videos Instantly"
        description="Know what's real. Free AI detector for text, photos, and videos — get an instant probability score backed by forensic signals."
        canonical="https://ondabir.com/"
      />
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/15 grid place-items-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="font-bold text-lg">AI Content Detector</h1>
              <span className="text-[10px] text-muted-foreground hidden sm:block">Know what's real.</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a>
            <Badge variant="outline" className="hidden sm:inline-flex">
              <ShieldCheck className="size-3 mr-1" /> Powered by Gemini 2.5 Pro
            </Badge>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 space-y-3">
          <ShopBanner />
          <MortgageCalculatorBanner />
        </div>
        <section className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">
            Is it written by a human or generated by AI?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload text, an image, or a short video. Our detector analyzes statistical, visual, and forensic
            signals to estimate the likelihood it was AI-generated.
          </p>
        </section>

        <StatsBar />

        <Card>
          <CardHeader>
            <CardTitle>Run a detection</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => { setTab(v as any); reset(); }}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="text"><FileText className="size-4 mr-1.5" />Text</TabsTrigger>
                <TabsTrigger value="image"><ImageIcon className="size-4 mr-1.5" />Image</TabsTrigger>
                <TabsTrigger value="video"><Video className="size-4 mr-1.5" />Video</TabsTrigger>
                <TabsTrigger value="url"><Link2 className="size-4 mr-1.5" />Link</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Paste the text you want to analyze (min. 20 characters)…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-2">{text.length} characters</p>
                <SampleTexts onPick={(t) => { setText(t); setResult(null); }} />
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <FileDrop
                  ref={fileRef}
                  accept="image/*"
                  preview={preview}
                  onFile={handleFile}
                  hint="PNG, JPG, WEBP up to 10MB"
                  isVideo={false}
                />
              </TabsContent>

              <TabsContent value="video" className="mt-4">
                <FileDrop
                  ref={fileRef}
                  accept="video/*"
                  preview={preview}
                  onFile={handleFile}
                  hint="MP4, MOV, WEBM up to 20MB"
                  isVideo
                />
              </TabsContent>

              <TabsContent value="url" className="mt-4 space-y-3">
                <Input
                  type="url"
                  placeholder="Paste a YouTube (video, Shorts, playlist), Vimeo, TikTok, X, Instagram or Facebook video URL…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  inputMode="url"
                />
                <p className="text-xs text-muted-foreground">
                  We analyze the video's thumbnail and metadata. Best with public links (e.g. https://youtube.com/watch?v=…).
                </p>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button onClick={analyze} disabled={loading} className="flex-1">
                {loading ? (
                  <><Loader2 className="size-4 mr-2 animate-spin" />Analyzing…</>
                ) : (
                  <><Sparkles className="size-4 mr-2" />Detect AI</>
                )}
              </Button>
              {(text || url || file || result) && (
                <Button variant="outline" onClick={reset} disabled={loading}>Clear</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>Result</CardTitle>
                <Badge variant="outline" className={verdictMeta[result.verdict].className}>
                  {verdictMeta[result.verdict].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">AI probability</span>
                  <span className="font-semibold">{Math.round(result.ai_probability)}%</span>
                </div>
                <Progress value={result.ai_probability} />
                <p className="text-xs text-muted-foreground mt-1.5">Confidence: {result.confidence}</p>
              </div>

              <p className="text-sm leading-relaxed">{result.summary}</p>

              {result.likely_model && result.likely_model !== "Unknown" && (
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">Most likely generator</div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-semibold flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      {result.likely_model}
                    </div>
                    {result.model_confidence && (
                      <Badge variant="outline" className="text-[10px]">
                        {result.model_confidence} confidence
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {result.signals?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="size-4 text-muted-foreground" />
                    Key signals
                  </h3>
                  <ul className="space-y-1.5">
                    {result.signals.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {shareUrl && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Shareable link (with social previews):</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      onFocus={(e) => e.currentTarget.select()}
                      className="flex-1 text-xs bg-secondary/40 border border-border rounded-md px-3 py-2 font-mono"
                    />
                    <Button onClick={handleShare} size="sm">
                      {copied ? <><Check className="size-4 mr-1.5" />Copied</> : <><Share2 className="size-4 mr-1.5" />Share</>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <SavedResults />

        <div className="mt-6">
          <EmailSignupBanner />
        </div>

        <section className="mt-12">
          <div className="text-center mb-5">
            <h3 className="text-2xl font-bold">Spot the difference</h3>
            <p className="text-sm text-muted-foreground mt-1">
              A real photograph next to one generated by an AI image model. Hover the labels to compare the tells.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={sampleReal}
                  alt="Real photograph of a woman laughing at a farmers market"
                  width={768}
                  height={768}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-emerald-500 text-white border-0">Real photo</Badge>
              </div>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Natural skin texture, asymmetric features, real environmental light, and a believably messy background.
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={sampleAi}
                  alt="AI-generated portrait with airbrushed skin and surreal lighting"
                  width={768}
                  height={768}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">AI-generated</Badge>
              </div>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Glossy "airbrushed" skin, perfectly symmetric face, painterly hair halo, and a surreal sunset that doesn't match the lighting on the face.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <UseCases />

        <EngagementToolsGrid className="mt-12" />

        <section className="mt-12">
          <div className="text-center mb-5">
            <h3 className="text-2xl font-bold">We name the model</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">
              When the content is likely AI, we go further and try to identify <em>which</em> tool generated it.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "ChatGPT", "Claude", "Gemini", "Llama", "Mistral", "DeepSeek", "Grok", "Perplexity",
              "Midjourney", "DALL·E 3", "Stable Diffusion", "Flux", "Adobe Firefly", "Ideogram", "Leonardo",
              "Sora", "Runway", "Pika", "Kling", "Veo", "HeyGen", "Synthesia",
            ].map((m) => (
              <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
            ))}
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            { icon: FileText, title: "Text detection", body: "Catches GPT, Claude, Gemini and more by analyzing perplexity and burstiness." },
            { icon: ImageIcon, title: "Image detection", body: "Spots diffusion artifacts, anatomy issues, and lighting inconsistencies." },
            { icon: Video, title: "Video detection", body: "Reviews frames for synthesis, deepfake, and interpolation artifacts." },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <Icon className="size-5 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <footer className="text-center text-xs text-muted-foreground mt-12 pb-6">
          Results are probabilistic and not legal proof. Always combine with human judgment.
        </footer>
      </main>
    </div>
  );
};

// --- File drop component ---
import { forwardRef } from "react";
const FileDrop = forwardRef<HTMLInputElement, {
  accept: string;
  preview: string | null;
  onFile: (f: File) => void;
  hint: string;
  isVideo: boolean;
}>(({ accept, preview, onFile, hint, isVideo }, ref) => {
  const inputRef = (ref as React.MutableRefObject<HTMLInputElement | null>) ?? { current: null };
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      {preview ? (
        <div className="relative border border-border rounded-lg overflow-hidden bg-secondary/30">
          {isVideo ? (
            <video src={preview} controls className="w-full max-h-[360px] object-contain" />
          ) : (
            <img src={preview} alt="Preview" className="w-full max-h-[360px] object-contain" />
          )}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => inputRef.current?.click()}
          >
            Change
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-lg p-10 hover:border-primary/50 hover:bg-secondary/30 transition-colors text-center"
        >
          <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium">Click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        </button>
      )}
    </div>
  );
});
FileDrop.displayName = "FileDrop";

export default AIDetector;
