import { X, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";

const bannerText: Record<string, string> = {
  tr: "💰 1 Milyon Dolar kazanma şansı! Çekilişe katılın →",
  en: "💰 Sign up to win $1,000,000! New Year's Eve draw →",
  fr: "💰 Inscrivez-vous pour gagner 1 000 000 $ ! Tirage du Nouvel An →",
  de: "💰 Melden Sie sich an, um $1.000.000 zu gewinnen! Silvester-Verlosung →",
  es: "💰 ¡Inscríbete para ganar $1,000,000! Sorteo de Nochevieja →",
  zh: "💰 注册赢取100万美元！除夕夜抽奖 →",
  hi: "💰 $1,000,000 जीतने के लिए साइन अप करें! नए साल की पूर्व संध्या ड्रॉ →",
  ja: "💰 100万ドルを獲得するチャンス！大晦日抽選 →",
  pt: "💰 Inscreva-se para ganhar $1.000.000! Sorteio de Ano Novo →",
  ru: "💰 Зарегистрируйтесь, чтобы выиграть $1 000 000! Новогодний розыгрыш →",
  it: "💰 Iscriviti per vincere $1.000.000! Estrazione di Capodanno →",
};

const MillionDollarBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { language } = useLanguage();
  const { localePath } = useLocalizedNavigate();

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-black py-2 px-4 animate-slide-up">
      <div className="container flex items-center justify-center gap-2 text-sm">
        <Trophy className="h-4 w-4 animate-pulse" />
        <a
          href={localePath("/million-dollar-draw")}
          className="flex items-center gap-2 hover:underline font-bold group"
        >
          <span>{bannerText[language] || bannerText.en}</span>
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-2 hover:bg-black/20 text-black transition-transform hover:scale-110"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MillionDollarBanner;
