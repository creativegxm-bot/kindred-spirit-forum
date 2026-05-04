import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";

const verdictMeta: Record<string, { label: string; className: string }> = {
  human: { label: "Human-written", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  likely_human: { label: "Likely human", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  uncertain: { label: "Uncertain", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  likely_ai: { label: "Likely AI", className: "bg-orange-500/15 text-orange-500 border-orange-500/30" },
  ai: { label: "AI-generated", className: "bg-red-500/15 text-red-500 border-red-500/30" },
};

interface Row {
  id: string;
  kind: "text" | "image" | "video";
  ai_probability: number;
  verdict: keyof typeof verdictMeta;
  confidence: string;
  signals: string[];
  summary: string;
  text_snippet: string | null;
  preview_url: string | null;
  created_at: string;
}

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("detection_results")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) setNotFound(true);
      else setRow(data as unknown as Row);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !row) {
    return (
      <div className="min-h-screen grid place-items-center text-center px-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Result not found</h1>
          <p className="text-muted-foreground mb-4">This share link is invalid or has expired.</p>
          <Link to="/"><Button>Run a new detection</Button></Link>
        </div>
      </div>
    );
  }

  const meta = verdictMeta[row.verdict];
  const pct = Math.round(row.ai_probability);
  const title = `${meta.label} — ${pct}% AI probability`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${title} | AI Content Detector`}
        description={row.summary}
        canonical={`https://ondabir.com/r/${row.id}`}
        ogType="article"
        image={row.preview_url || undefined}
      />
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/15 grid place-items-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <span className="font-bold">AI Content Detector</span>
          </Link>
          <Link to="/"><Button variant="outline" size="sm"><ArrowLeft className="size-4 mr-1.5" />New scan</Button></Link>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>Detection result</CardTitle>
              <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">AI probability</span>
                <span className="font-semibold">{pct}%</span>
              </div>
              <Progress value={pct} />
              <p className="text-xs text-muted-foreground mt-1.5">
                Confidence: {row.confidence} · {new Date(row.created_at).toLocaleString()}
              </p>
            </div>

            <p className="text-sm leading-relaxed">{row.summary}</p>

            {row.signals?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-muted-foreground" />Key signals
                </h3>
                <ul className="space-y-1.5">
                  {row.signals.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {row.preview_url && (
              <div className="rounded-lg overflow-hidden border border-border">
                {row.kind === "video" ? (
                  <video src={row.preview_url} controls className="w-full max-h-[420px] object-contain bg-secondary/30" />
                ) : (
                  <img src={row.preview_url} alt="Analyzed" className="w-full max-h-[420px] object-contain bg-secondary/30" />
                )}
              </div>
            )}

            {row.text_snippet && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Analyzed text</h3>
                <p className="text-sm whitespace-pre-wrap bg-secondary/30 border border-border rounded-md p-3">
                  {row.text_snippet}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResultPage;
