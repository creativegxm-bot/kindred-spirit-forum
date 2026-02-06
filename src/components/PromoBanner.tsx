import { ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 animate-slide-up glow-primary">
      <div className="container flex items-center justify-center gap-2 text-sm">
        <a
          href="https://iplocation2.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline font-medium group"
        >
          <span className="animate-pulse-subtle">{t("promoBanner")}</span>
          <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-2 hover:bg-primary-foreground/20 text-primary-foreground transition-transform hover:scale-110"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PromoBanner;
