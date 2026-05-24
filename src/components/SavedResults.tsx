import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Trash2, ExternalLink, FileText, Image as ImageIcon, Video, Link2 } from "lucide-react";

export type SavedEntry = {
  id: string; // detection_results id (for share link)
  kind: "text" | "image" | "video" | "url";
  ai_probability: number;
  verdict: "human" | "likely_human" | "uncertain" | "likely_ai" | "ai";
  confidence: "low" | "medium" | "high";
  summary: string;
  snippet?: string | null;
  preview_url?: string | null;
  created_at: number;
};

const STORAGE_KEY = "ondabir.ai_detector.history";
const MAX_ENTRIES = 20;

const verdictMeta: Record<SavedEntry["verdict"], { label: string; className: string }> = {
  human: { label: "Human", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  likely_human: { label: "Likely human", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  uncertain: { label: "Uncertain", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  likely_ai: { label: "Likely AI", className: "bg-orange-500/15 text-orange-500 border-orange-500/30" },
  ai: { label: "AI", className: "bg-red-500/15 text-red-500 border-red-500/30" },
};

const kindIcon: Record<SavedEntry["kind"], React.ReactNode> = {
  text: <FileText className="size-3.5" />,
  image: <ImageIcon className="size-3.5" />,
  video: <Video className="size-3.5" />,
  url: <Link2 className="size-3.5" />,
};

export const loadHistory = (): SavedEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const saveEntry = (entry: SavedEntry) => {
  try {
    const current = loadHistory().filter((e) => e.id !== entry.id);
    const next = [entry, ...current].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("ondabir:history-updated"));
  } catch {
    /* ignore quota errors */
  }
};

const clearAll = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("ondabir:history-updated"));
};

const removeOne = (id: string) => {
  const next = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("ondabir:history-updated"));
};

const timeAgo = (ts: number) => {
  const diff = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const SavedResults = () => {
  const [entries, setEntries] = useState<SavedEntry[]>([]);

  useEffect(() => {
    const sync = () => setEntries(loadHistory());
    sync();
    window.addEventListener("ondabir:history-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ondabir:history-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Saved results
            <Badge variant="outline" className="ml-1">{entries.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 className="size-4 mr-1.5" />Clear all
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Your last {MAX_ENTRIES} detections are saved on this device only.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {entries.map((e) => {
            const meta = verdictMeta[e.verdict];
            const shareUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-result/${e.id}`;
            const label =
              e.kind === "text"
                ? e.snippet?.slice(0, 80) || "Text snippet"
                : e.kind === "url"
                ? e.snippet || "Link"
                : e.summary.slice(0, 80);
            return (
              <li key={e.id} className="py-3 flex items-center gap-3">
                {e.preview_url && (e.kind === "image" || e.kind === "video") ? (
                  <img
                    src={e.preview_url}
                    alt=""
                    className="size-12 rounded-md object-cover bg-secondary shrink-0"
                  />
                ) : (
                  <div className="size-12 rounded-md bg-secondary grid place-items-center text-muted-foreground shrink-0">
                    {kindIcon[e.kind]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <Badge variant="outline" className={`${meta.className} text-[10px]`}>
                      {meta.label} · {Math.round(e.ai_probability)}%
                    </Badge>
                    <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                      {kindIcon[e.kind]} {e.kind}
                    </span>
                    <span className="text-[10px] text-muted-foreground">· {timeAgo(e.created_at)}</span>
                  </div>
                  <p className="text-sm truncate text-foreground/90">{label}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={`/r/${e.id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" title="Open result">
                      <ExternalLink className="size-4" />
                    </Button>
                  </a>
                  <Button variant="ghost" size="icon" title="Remove" onClick={() => removeOne(e.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SavedResults;
