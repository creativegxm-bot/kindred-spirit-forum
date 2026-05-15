import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

const ShopBanner = () => (
  <Link
    to="/shop"
    className="block bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/30 rounded-lg px-4 py-3 hover:border-primary transition-colors group"
  >
    <div className="container max-w-5xl mx-auto flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary/20 grid place-items-center shrink-0">
          <ShoppingBag className="size-4 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm sm:text-base">Wholesale Shop — Socks, Hats & Gloves</div>
          <div className="text-xs text-muted-foreground">
            50+ bulk products from a US supplier. Call or text 908-987-7387 for quotes.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm text-primary font-medium shrink-0">
        <span className="hidden sm:inline">Browse</span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  </Link>
);

export default ShopBanner;
