import { Users, FileSearch, Zap, ShieldCheck } from "lucide-react";

const stats = [
  { icon: FileSearch, value: "2.4M+", label: "items analyzed" },
  { icon: Users, value: "180k", label: "monthly users" },
  { icon: Zap, value: "< 6s", label: "average response" },
  { icon: ShieldCheck, value: "94%", label: "verified accuracy" },
];

const StatsBar = () => (
  <section className="mt-10 rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, value, label }) => (
        <div key={label} className="text-center">
          <Icon className="size-5 text-primary mx-auto mb-1.5" />
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
        </div>
      ))}
    </div>
  </section>
);

export default StatsBar;
