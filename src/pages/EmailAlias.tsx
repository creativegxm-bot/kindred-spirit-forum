import { useState, useEffect } from "react";
import { Mail, Loader2, Trash2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AliasData {
  id: string;
  alias: string;
  forward_to: string;
  is_active: boolean;
  created_at: string;
}

const EmailAlias = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { navigate } = useLocalizedNavigate();
  const { toast } = useToast();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const [alias, setAlias] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [existingAlias, setExistingAlias] = useState<AliasData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    if (user) fetchAlias();
    else setFetching(false);
  }, [user]);

  const fetchAlias = async () => {
    setFetching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await supabase.functions.invoke("manage-email-alias", {
        body: { action: "get" },
      });

      if (res.data?.alias) {
        setExistingAlias(res.data.alias);
      }
    } catch (err) {
      console.error("Error fetching alias:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() || !forwardTo.trim()) return;

    setLoading(true);
    try {
      const res = await supabase.functions.invoke("manage-email-alias", {
        body: { action: "create", alias: alias.toLowerCase().trim(), forward_to: forwardTo.trim() },
      });

      if (res.error || res.data?.error) {
        toast({
          title: language === "tr" ? "Hata" : "Error",
          description: res.data?.error || res.error?.message || "Unknown error",
          variant: "destructive",
        });
      } else {
        toast({
          title: language === "tr" ? "E-posta oluşturuldu!" : "Email created!",
          description: `${alias}@ondabir.com`,
        });
        setAlias("");
        setForwardTo("");
        fetchAlias();
      }
    } catch (err: any) {
      toast({
        title: language === "tr" ? "Hata" : "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("manage-email-alias", {
        body: { action: "delete" },
      });

      if (res.error || res.data?.error) {
        toast({
          title: language === "tr" ? "Hata" : "Error",
          description: res.data?.error || res.error?.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: language === "tr" ? "Silindi" : "Deleted",
          description: language === "tr" ? "E-posta yönlendirmeniz kaldırıldı." : "Your email forwarding has been removed.",
        });
        setExistingAlias(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => navigate("/")}
        onMenuToggle={() => {}}
        onOpenAuth={openAuth}
      />

      <main className="max-w-xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === "tr" ? "Geri" : "Back"}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {language === "tr" ? "E-posta Adresi Al" : "Get Email Address"}
            </CardTitle>
            <CardDescription>
              {language === "tr"
                ? "Ücretsiz bir @ondabir.com e-posta adresi alın. Gelen e-postalar kişisel adresinize yönlendirilir."
                : "Get a free @ondabir.com email address. Incoming emails are forwarded to your personal address."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!user ? (
              <div className="text-center py-8 space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  {language === "tr"
                    ? "E-posta adresi almak için giriş yapın."
                    : "Log in to get an email address."}
                </p>
                <Button onClick={() => openAuth("login")} variant="create">
                  {language === "tr" ? "Giriş Yap" : "Log In"}
                </Button>
              </div>
            ) : fetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : existingAlias ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">
                      {existingAlias.alias}@ondabir.com
                    </p>
                    <p className="text-sm text-muted-foreground">
                      → {existingAlias.forward_to}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === "tr"
                    ? "Bu adrese gönderilen e-postalar otomatik olarak kişisel adresinize yönlendirilir."
                    : "Emails sent to this address are automatically forwarded to your personal email."}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {language === "tr" ? "Adresi Sil" : "Delete Address"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "tr" ? "Kullanıcı adı" : "Username"}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={alias}
                      onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                      placeholder={language === "tr" ? "kullaniciadi" : "username"}
                      className="bg-secondary border-none"
                      required
                    />
                    <span className="text-muted-foreground font-medium whitespace-nowrap">@ondabir.com</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === "tr"
                      ? "Küçük harf, rakam, nokta, tire ve alt çizgi kullanabilirsiniz."
                      : "Use lowercase letters, numbers, dots, hyphens, underscores."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{language === "tr" ? "Yönlendirme adresi" : "Forward to"}</Label>
                  <Input
                    type="email"
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                    placeholder={language === "tr" ? "gercek@email.com" : "your@email.com"}
                    className="bg-secondary border-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === "tr"
                      ? "Gelen e-postalar bu adrese yönlendirilecek."
                      : "Incoming emails will be forwarded to this address."}
                  </p>
                </div>

                <Button type="submit" variant="create" className="w-full" disabled={loading || !alias || !forwardTo}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />{language === "tr" ? "Oluşturuluyor..." : "Creating..."}</>
                  ) : (
                    <><Mail className="h-4 w-4 mr-2" />{language === "tr" ? "E-posta Oluştur" : "Create Email"}</>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default EmailAlias;
