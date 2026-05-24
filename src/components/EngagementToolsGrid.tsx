import { Link } from "react-router-dom";
import { Calculator, ShoppingBag, BookOpen, Sparkles } from "lucide-react";

type Tool = {
  to: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  badge?: string;
};

const tools: Tool[] = [
  {
    to: "/mortgage-calculator",
    title: "Mortgage Calculator",
    desc: "Estimate payments, taxes, PMI & amortization in seconds.",
    icon: Calculator,
    accent: "from-blue-500/20 to-sky-500/10 text-sky-400",
  },
  {
    to: "/shop",
    title: "Wholesale Shop",
    desc: "Bulk socks, hats & gloves from a US supplier.",
    icon: ShoppingBag,
    accent: "from-orange-500/20 to-amber-500/10 text-orange-400",
    badge: "NEW",
  },
  {
    to: "/blog",
    title: "AI Detection Blog",
    desc: "Guides on spotting AI text, deepfakes & synthetic media.",
    icon: BookOpen,
    accent: "from-violet-500/20 to-fuchsia-500/10 text-fuchsia-400",
  },
  {
    to: "/",
    title: "AI Content Detector",
    desc: "Text, image & video — instant probability score.",
    icon: Sparkles,
    accent: "from-primary/20 to-rose-500/10 text-primary",
  },
];

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
};

const EngagementToolsGrid = ({
  title = "More free tools",
  subtitle = "Hand-picked utilities — all free, all in one place.",
  className = "",
}: Props) => (
  <section className={className}>
    <div className="text-center mb-5">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">{subtitle}</p>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tools.map(({ to, title, desc, icon: Icon, accent, badge }) => (
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

export default EngagementToolsGrid;
