import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Bell, Check, Loader2 } from "lucide-react";

const STORAGE_KEY = "ondabir.ai_detector.subscribed_email";

const EmailSignupBanner = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(() => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("newsletter_signups").insert({ email: trimmed, source_page: "ai-detector" });
      if (error && error.code !== "23505") {
        throw error;
      }
      localStorage.setItem(STORAGE_KEY, trimmed);
      setSubscribed(true);
      toast({ title: "You're subscribed!", description: "New tools and detection tips will head your way." });
    } catch {
      toast({ title: "Couldn't subscribe", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-primary/10 to-transparent border border-emerald-500/30 rounded-lg px-4 py-3">
        <div className="container max-w-5xl mx-auto flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/20 grid place-items-center shrink-0">
            <Check className="size-4 text-emerald-500" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-sm sm:text-base text-emerald-500">You're on the list</div>
            <div className="text-xs text-muted-foreground">We'll email you when new detection tools and tips drop.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/30 rounded-lg px-4 py-3">
      <form onSubmit={handleSubmit} className="container max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/20 grid place-items-center shrink-0">
            <Bell className="size-4 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-sm sm:text-base">Get new AI tools & detection tips</div>
            <div className="text-xs text-muted-foreground">
              One email when we release features. No spam, unsubscribe anytime.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 h-9 text-sm"
              required
            />
          </div>
          <Button type="submit" size="sm" disabled={loading} className="shrink-0">
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Subscribe"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmailSignupBanner;
