import { useState } from "react";
import { X, Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

const AuthModal = ({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!username.trim()) {
          toast({
            title: language === "tr" ? "Kullanıcı adı gerekli" : "Username required",
            description: language === "tr" ? "Lütfen bir kullanıcı adı girin" : "Please enter a username",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          toast({
            title: language === "tr" ? "Kayıt başarısız" : "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: language === "tr" ? "Readit'e hoş geldin!" : "Welcome to Readit!",
            description: language === "tr" ? "Hesabın başarıyla oluşturuldu." : "Your account has been created.",
          });
          onClose();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: language === "tr" ? "Giriş başarısız" : "Login failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: language === "tr" ? "Tekrar hoş geldin!" : "Welcome back!",
            description: language === "tr" ? "Başarıyla giriş yaptın." : "You have successfully logged in.",
          });
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md card-gradient rounded-lg border border-border animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">
            {mode === "login" 
              ? (language === "tr" ? "Tekrar hoş geldin" : "Welcome back")
              : (language === "tr" ? "Readit'e Katıl" : "Join Readit")}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder={language === "tr" ? "havalıkullanıcı123" : "cooluser123"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-secondary border-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={language === "tr" ? "sen@ornek.com" : "you@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-secondary border-none"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" variant="create" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" 
                  ? (language === "tr" ? "Giriş yapılıyor..." : "Logging in...")
                  : (language === "tr" ? "Hesap oluşturuluyor..." : "Creating account...")}
              </>
            ) : mode === "login" ? (
              t("login")
            ) : (
              t("signup")
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {t("noAccount")}{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setMode("signup")}
                >
                  {t("signup")}
                </button>
              </>
            ) : (
              <>
                {t("haveAccount")}{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setMode("login")}
                >
                  {t("login")}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
