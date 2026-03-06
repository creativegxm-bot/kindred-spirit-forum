import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trophy, Users, Calendar, PartyPopper, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";

const translations: Record<string, Record<string, string>> = {
  tr: {
    title: "1 Milyon Dolar Çekilişi",
    subtitle: "Yılbaşı gecesi çekilecek büyük ödül!",
    drawDate: "Çekiliş Tarihi: 31 Aralık 2026, Gece Yarısı",
    fullName: "Ad Soyad",
    email: "E-posta",
    country: "Ülke",
    enterDraw: "Çekilişe Katıl",
    alreadyEntered: "Çekilişe Katıldınız! ✅",
    alreadyEnteredDesc: "Yılbaşı gecesi büyük çekilişe dahilsiniz.",
    participants: "Katılımcı",
    loginRequired: "Katılmak için giriş yapın",
    successTitle: "Başarıyla kaydoldunuz!",
    successDesc: "Yılbaşı gecesi çekilişine dahil edildiniz.",
    rules: "Çekiliş Kuralları",
    rule1: "Katılım ücretsizdir",
    rule2: "Her kullanıcı yalnızca bir kez katılabilir",
    rule3: "Kazanan 31 Aralık 2026 gece yarısı belirlenecektir",
    rule4: "Kazanana e-posta ile bildirim yapılacaktır",
    prize: "BÜYÜK ÖDÜL",
    prizeAmount: "$1,000,000",
  },
  en: {
    title: "Million Dollar Draw",
    subtitle: "Grand prize drawn on New Year's Eve!",
    drawDate: "Draw Date: December 31, 2026, Midnight",
    fullName: "Full Name",
    email: "Email",
    country: "Country",
    enterDraw: "Enter the Draw",
    alreadyEntered: "You're In! ✅",
    alreadyEnteredDesc: "You're entered in the New Year's Eve grand draw.",
    participants: "Participants",
    loginRequired: "Sign in to participate",
    successTitle: "Successfully registered!",
    successDesc: "You've been entered in the New Year's Eve draw.",
    rules: "Draw Rules",
    rule1: "Entry is completely free",
    rule2: "Each user can only enter once",
    rule3: "Winner will be selected on December 31, 2026 at midnight",
    rule4: "Winner will be notified by email",
    prize: "GRAND PRIZE",
    prizeAmount: "$1,000,000",
  },
  fr: {
    title: "Tirage au Sort d'un Million de Dollars",
    subtitle: "Grand prix tiré le soir du Nouvel An !",
    drawDate: "Date du tirage : 31 décembre 2026, minuit",
    fullName: "Nom complet",
    email: "E-mail",
    country: "Pays",
    enterDraw: "Participer au tirage",
    alreadyEntered: "Vous êtes inscrit ! ✅",
    alreadyEnteredDesc: "Vous participez au grand tirage du Nouvel An.",
    participants: "Participants",
    loginRequired: "Connectez-vous pour participer",
    successTitle: "Inscription réussie !",
    successDesc: "Vous êtes inscrit au tirage du Nouvel An.",
    rules: "Règles du tirage",
    rule1: "La participation est gratuite",
    rule2: "Chaque utilisateur ne peut participer qu'une seule fois",
    rule3: "Le gagnant sera sélectionné le 31 décembre 2026 à minuit",
    rule4: "Le gagnant sera notifié par e-mail",
    prize: "GRAND PRIX",
    prizeAmount: "1 000 000 $",
  },
  de: {
    title: "Millionen-Dollar-Verlosung",
    subtitle: "Hauptpreis wird an Silvester gezogen!",
    drawDate: "Ziehungsdatum: 31. Dezember 2026, Mitternacht",
    fullName: "Vollständiger Name",
    email: "E-Mail",
    country: "Land",
    enterDraw: "An der Verlosung teilnehmen",
    alreadyEntered: "Sie sind dabei! ✅",
    alreadyEnteredDesc: "Sie nehmen an der Silvester-Verlosung teil.",
    participants: "Teilnehmer",
    loginRequired: "Melden Sie sich an, um teilzunehmen",
    successTitle: "Erfolgreich registriert!",
    successDesc: "Sie wurden in die Silvester-Verlosung aufgenommen.",
    rules: "Verlosungsregeln",
    rule1: "Die Teilnahme ist kostenlos",
    rule2: "Jeder Benutzer kann nur einmal teilnehmen",
    rule3: "Der Gewinner wird am 31. Dezember 2026 um Mitternacht ermittelt",
    rule4: "Der Gewinner wird per E-Mail benachrichtigt",
    prize: "HAUPTPREIS",
    prizeAmount: "1.000.000 $",
  },
  es: {
    title: "Sorteo de un Millón de Dólares",
    subtitle: "¡Gran premio sorteado en Nochevieja!",
    drawDate: "Fecha del sorteo: 31 de diciembre de 2026, medianoche",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    country: "País",
    enterDraw: "Participar en el sorteo",
    alreadyEntered: "¡Estás inscrito! ✅",
    alreadyEnteredDesc: "Participas en el gran sorteo de Nochevieja.",
    participants: "Participantes",
    loginRequired: "Inicia sesión para participar",
    successTitle: "¡Registro exitoso!",
    successDesc: "Has sido inscrito en el sorteo de Nochevieja.",
    rules: "Reglas del sorteo",
    rule1: "La participación es gratuita",
    rule2: "Cada usuario puede participar solo una vez",
    rule3: "El ganador será seleccionado el 31 de diciembre de 2026 a medianoche",
    rule4: "El ganador será notificado por correo electrónico",
    prize: "GRAN PREMIO",
    prizeAmount: "$1,000,000",
  },
  zh: {
    title: "百万美元抽奖",
    subtitle: "大奖将在除夕夜抽出！",
    drawDate: "抽奖日期：2026年12月31日午夜",
    fullName: "全名",
    email: "电子邮件",
    country: "国家",
    enterDraw: "参加抽奖",
    alreadyEntered: "您已参加！✅",
    alreadyEnteredDesc: "您已参加除夕夜大抽奖。",
    participants: "参与者",
    loginRequired: "登录以参加",
    successTitle: "注册成功！",
    successDesc: "您已被纳入除夕夜抽奖。",
    rules: "抽奖规则",
    rule1: "参加完全免费",
    rule2: "每位用户只能参加一次",
    rule3: "获奖者将于2026年12月31日午夜揭晓",
    rule4: "获奖者将通过电子邮件通知",
    prize: "大奖",
    prizeAmount: "$1,000,000",
  },
  hi: {
    title: "दस लाख डॉलर का ड्रॉ",
    subtitle: "नए साल की पूर्व संध्या पर ग्रैंड प्राइज!",
    drawDate: "ड्रॉ तिथि: 31 दिसंबर 2026, आधी रात",
    fullName: "पूरा नाम",
    email: "ईमेल",
    country: "देश",
    enterDraw: "ड्रॉ में भाग लें",
    alreadyEntered: "आप शामिल हैं! ✅",
    alreadyEnteredDesc: "आप नए साल की पूर्व संध्या के ग्रैंड ड्रॉ में शामिल हैं।",
    participants: "प्रतिभागी",
    loginRequired: "भाग लेने के लिए लॉगिन करें",
    successTitle: "सफलतापूर्वक पंजीकृत!",
    successDesc: "आपको नए साल की पूर्व संध्या के ड्रॉ में शामिल किया गया है।",
    rules: "ड्रॉ नियम",
    rule1: "प्रवेश पूरी तरह मुफ्त है",
    rule2: "प्रत्येक उपयोगकर्ता केवल एक बार भाग ले सकता है",
    rule3: "विजेता 31 दिसंबर 2026 को आधी रात चुना जाएगा",
    rule4: "विजेता को ईमेल द्वारा सूचित किया जाएगा",
    prize: "ग्रैंड प्राइज",
    prizeAmount: "$1,000,000",
  },
  ja: {
    title: "100万ドル抽選",
    subtitle: "大晦日にグランプリが抽選されます！",
    drawDate: "抽選日：2026年12月31日深夜",
    fullName: "氏名",
    email: "メール",
    country: "国",
    enterDraw: "抽選に参加",
    alreadyEntered: "参加済みです！✅",
    alreadyEnteredDesc: "大晦日のグランド抽選に参加しています。",
    participants: "参加者",
    loginRequired: "参加するにはログインしてください",
    successTitle: "登録完了！",
    successDesc: "大晦日の抽選に登録されました。",
    rules: "抽選ルール",
    rule1: "参加は無料です",
    rule2: "各ユーザーは1回のみ参加できます",
    rule3: "当選者は2026年12月31日深夜に選ばれます",
    rule4: "当選者にはメールで通知されます",
    prize: "グランプリ",
    prizeAmount: "$1,000,000",
  },
  pt: {
    title: "Sorteio de um Milhão de Dólares",
    subtitle: "Grande prêmio sorteado na véspera de Ano Novo!",
    drawDate: "Data do sorteio: 31 de dezembro de 2026, meia-noite",
    fullName: "Nome completo",
    email: "E-mail",
    country: "País",
    enterDraw: "Participar do sorteio",
    alreadyEntered: "Você está inscrito! ✅",
    alreadyEnteredDesc: "Você participa do grande sorteio de Ano Novo.",
    participants: "Participantes",
    loginRequired: "Faça login para participar",
    successTitle: "Registro bem-sucedido!",
    successDesc: "Você foi inscrito no sorteio de Ano Novo.",
    rules: "Regras do sorteio",
    rule1: "A participação é gratuita",
    rule2: "Cada usuário pode participar apenas uma vez",
    rule3: "O vencedor será selecionado em 31 de dezembro de 2026 à meia-noite",
    rule4: "O vencedor será notificado por e-mail",
    prize: "GRANDE PRÊMIO",
    prizeAmount: "US$ 1.000.000",
  },
  ru: {
    title: "Розыгрыш миллиона долларов",
    subtitle: "Главный приз будет разыгран в новогоднюю ночь!",
    drawDate: "Дата розыгрыша: 31 декабря 2026, полночь",
    fullName: "Полное имя",
    email: "Электронная почта",
    country: "Страна",
    enterDraw: "Участвовать в розыгрыше",
    alreadyEntered: "Вы участвуете! ✅",
    alreadyEnteredDesc: "Вы участвуете в новогоднем розыгрыше.",
    participants: "Участники",
    loginRequired: "Войдите, чтобы участвовать",
    successTitle: "Успешная регистрация!",
    successDesc: "Вы включены в новогодний розыгрыш.",
    rules: "Правила розыгрыша",
    rule1: "Участие бесплатное",
    rule2: "Каждый пользователь может участвовать только один раз",
    rule3: "Победитель будет определён 31 декабря 2026 в полночь",
    rule4: "Победитель будет уведомлён по электронной почте",
    prize: "ГЛАВНЫЙ ПРИЗ",
    prizeAmount: "$1 000 000",
  },
  it: {
    title: "Estrazione da un Milione di Dollari",
    subtitle: "Gran premio estratto la notte di Capodanno!",
    drawDate: "Data dell'estrazione: 31 dicembre 2026, mezzanotte",
    fullName: "Nome completo",
    email: "E-mail",
    country: "Paese",
    enterDraw: "Partecipa all'estrazione",
    alreadyEntered: "Sei iscritto! ✅",
    alreadyEnteredDesc: "Partecipi alla grande estrazione di Capodanno.",
    participants: "Partecipanti",
    loginRequired: "Accedi per partecipare",
    successTitle: "Registrazione riuscita!",
    successDesc: "Sei stato iscritto all'estrazione di Capodanno.",
    rules: "Regole dell'estrazione",
    rule1: "La partecipazione è gratuita",
    rule2: "Ogni utente può partecipare solo una volta",
    rule3: "Il vincitore sarà selezionato il 31 dicembre 2026 a mezzanotte",
    rule4: "Il vincitore sarà notificato via e-mail",
    prize: "GRAN PREMIO",
    prizeAmount: "$1.000.000",
  },
};

const MillionDollarDraw = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  useEffect(() => {
    const fetchCount = async () => {
      const { data, error } = await supabase.rpc("get_draw_entry_count");
      if (!error && data !== null) {
        setParticipantCount(Number(data));
      }
    };
    fetchCount();
  }, [hasEntered]);

  useEffect(() => {
    if (!user) return;
    const checkEntry = async () => {
      const { data } = await supabase
        .from("draw_entries")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setHasEntered(true);
    };
    checkEntry();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthMode("signup");
      setAuthModalOpen(true);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("draw_entries").insert({
      user_id: user.id,
      full_name: fullName,
      email,
      country: country || null,
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        setHasEntered(true);
      } else {
        toast.error(error.message);
      }
      return;
    }
    setHasEntered(true);
    toast.success(t.successTitle, { description: t.successDesc });
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Countdown to Dec 31, 2026
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const target = new Date("2026-12-31T00:00:00").getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown("🎉");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${days}d ${hours}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => {}}
        onMenuToggle={() => {}}
        onOpenAuth={openAuth}
      />

      <div className="container max-w-3xl py-8 px-4">
        <Link to={localePath("/")}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {language === "tr" ? "Ana Sayfa" : "Home"}
          </Button>
        </Link>

        {/* Hero */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold">
            <Trophy className="h-5 w-5" />
            {t.prize}
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            {t.prizeAmount}
          </h1>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>

          {/* Countdown */}
          <div className="text-3xl font-mono font-bold text-primary">{countdown}</div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {t.drawDate}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center mb-8">
          <div className="rounded-xl border border-border bg-card px-8 py-4 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-3xl font-bold text-primary">{participantCount.toLocaleString()}</p>
            <p className="text-muted-foreground text-sm">{t.participants}</p>
          </div>
        </div>

        {/* Form / Success */}
        {hasEntered ? (
          <div className="rounded-xl border-2 border-green-500/30 bg-green-500/5 p-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400">{t.alreadyEntered}</h3>
            <p className="text-muted-foreground">{t.alreadyEnteredDesc}</p>
            <PartyPopper className="h-8 w-8 text-yellow-500 mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
            {!user && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">{t.loginRequired}</p>
                <Button type="button" onClick={() => openAuth("signup")}>
                  {language === "tr" ? "Kayıt Ol" : "Sign Up"}
                </Button>
              </div>
            )}
            {user && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground">{t.fullName} *</label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t.email} *</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t.country}</label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} className="mt-1" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold text-lg py-6">
                  <Trophy className="h-5 w-5 mr-2" />
                  {t.enterDraw}
                </Button>
              </>
            )}
          </form>
        )}

        {/* Rules */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-lg mb-3">{t.rules}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[t.rule1, t.rule2, t.rule3, t.rule4].map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-bold">{i + 1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
      <Footer />
    </div>
  );
};

export default MillionDollarDraw;
