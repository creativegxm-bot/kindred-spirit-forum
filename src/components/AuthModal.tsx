import { useState } from "react";
import { X, Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
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
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!username.trim()) {
          toast({
            title: "Kullanıcı adı gerekli",
            description: "Lütfen bir kullanıcı adı girin",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          toast({
            title: "Kayıt başarısız",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Readit'e hoş geldin!",
            description: "Hesabın başarıyla oluşturuldu.",
          });
          onClose();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Giriş başarısız",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Tekrar hoş geldin!",
            description: "Başarıyla giriş yaptın.",
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
            {mode === "login" ? "Tekrar hoş geldin" : "Readit'e Katıl"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="havalıkullanıcı123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-secondary border-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="sen@ornek.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
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
                {mode === "login" ? "Giriş yapılıyor..." : "Hesap oluşturuluyor..."}
              </>
            ) : mode === "login" ? (
              "Giriş Yap"
            ) : (
              "Kayıt Ol"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Readit'te yeni misin?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Kayıt ol
                </button>
              </>
            ) : (
              <>
                Zaten hesabın var mı?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setMode("login")}
                >
                  Giriş yap
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
