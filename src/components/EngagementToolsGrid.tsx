import { Link } from "react-router-dom";
import {
  Trophy,
  Brain,
  Calculator,
  FileImage,
  Sparkles,
  ShoppingBag,
  Gamepad2,
  Heart,
  Newspaper,
  Mail,
  Home,
  Wand2,
} from "lucide-react";

type Tool = {
  to: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  badge?: string;
};

const tools: Tool[] = [
  { to: "/million-dollar-draw", title: "$1M Draw", desc: "Free entry — New Year's Eve", icon: Trophy, accent: "from-yellow-500/20 to-amber-500/10 text-amber-500", badge: "HOT" },
  { to: "/iq-test", title: "IQ Test", desc: "30 questions, instant score", icon: Brain, accent: "from-purple-500/20 to-fuchsia-500/10 text-fuchsia-400" },
  { to: "/mortgage-calculator", title: "Mortgage Calc", desc: "Payments, taxes & PMI", icon: Calculator, accent: "from-blue-500/20 to-sky-500/10 text-sky-400" },
  { to: "/file-converter", title: "File Converter", desc: "PNG, JPG, WEBP, PDF", icon: FileImage, accent: "from-emerald-500/20 to-green-500/10 text-emerald-400" },
  { to: "/ai-photo-enhancer", title: "Photo Enhancer", desc: "Upscale & restore with AI", icon: Wand2, accent: "from-primary/20 to-orange-500/10 text-primary", badge: "AI" },
  { to: "/ai-apps", title: "Top AI Apps", desc: "Ranked picks for every task", icon: Sparkles, accent: "from-violet-500/20 to-indigo-500/10 text-violet-400" },
  { to: "/match-finder", title: "Match Finder", desc: "Find your people", icon: Heart, accent: "from-rose-500/20 to-pink-500/10 text-rose-400" },
  { to: "/roblox", title: "Roblox Games", desc: "Trending games & guides", icon: Gamepad2, accent: "from-green-500/20 to-lime-500/10 text-green-400" },
  { to: "/news", title: "Latest News", desc: "Tech, AI & world updates", icon: Newspaper, accent: "from-cyan-500/20 to-teal-500/10 text-cyan-400" },
  { to: "/shop", title: "Wholesale Shop", desc: "Socks, hats & gloves in bulk", icon: ShoppingBag, accent: "from-orange-500/20 to-amber-500/10 text-orange-400" },
  { to: "/email-alias", title: "Email Alias", desc: "Free forwarding addresses", icon: Mail, accent: "from-indigo-500/20 to-blue-500/10 text-indigo-400" },
  { to: "/", title: "Community Feed", desc: "Join the discussion", icon: Home, accent: "from-primary/20 to-rose-500/10 text-primary" },
];

type Props = {
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
};

const EngagementToolsGrid = ({
  title = "More free tools you'll love",
  subtitle = "Hand-picked utilities, games and resources — all free, all in one place.",
  limit,
  className = "",
}: Props) => {
  const items = limit ? tools.slice(0, limit) : tools;

  return (
    <section className={className}>
      <div className="text-center mb-5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(({ to, title, desc, icon: Icon, accent, badge }) => (
          <Link
            key={to + title}
            to={to}
            className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all"
          >
            {badge && (
              <span className="absolute top-2 right-2 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-primary text-primary-foreground">
                {badge}
              </span>
            )}
            <div className={`size-10 rounded-lg bg-gradient-to-br ${accent} grid place-items-center mb-3`}>
              <Icon className="size-5" />
            </div>
            <div className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {title}
            </div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default EngagementToolsGrid;
