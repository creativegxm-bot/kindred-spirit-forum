import { Link } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";

const MortgageCalculatorBanner = () => (
  <Link
    to="/mortgage-calculator"
    className="block bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/30 rounded-lg px-4 py-3 hover:border-primary transition-colors group"
  >
    <div className="container max-w-5xl mx-auto flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary/20 grid place-items-center shrink-0">
          <Home className="size-4 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm sm:text-base">Free Mortgage Calculator</div>
          <div className="text-xs text-muted-foreground">
            Estimate monthly payments, taxes, PMI & amortization in seconds.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm text-primary font-medium shrink-0">
        <span className="hidden sm:inline">Try it</span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  </Link>
);

export default MortgageCalculatorBanner;
