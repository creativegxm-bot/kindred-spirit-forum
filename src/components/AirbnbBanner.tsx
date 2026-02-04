import { ExternalLink, X, Home } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const AirbnbBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 px-4 animate-slide-up">
      <div className="container flex items-center justify-center gap-2 text-sm">
        <Home className="h-4 w-4 animate-pulse" />
        <a
          href="https://www.airbnb.com/rp/marjoriej2409?p=stay"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline font-medium group"
        >
          <span>🏠 Evinizi Airbnb'de kiralayarak para kazanın!</span>
          <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-2 hover:bg-white/20 text-white transition-transform hover:scale-110"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AirbnbBanner;
