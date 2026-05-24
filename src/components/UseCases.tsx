import { GraduationCap, Briefcase, Newspaper, ShoppingCart, Scale, Heart } from "lucide-react";

const cases = [
  { icon: GraduationCap, title: "Teachers & professors", desc: "Catch AI-written essays before grading. Get explainable signals to back up the call." },
  { icon: Briefcase, title: "Recruiters & HR", desc: "Spot AI-generated cover letters and inflated résumés in seconds." },
  { icon: Newspaper, title: "Journalists & editors", desc: "Verify quotes, op-eds and source images before they hit print." },
  { icon: ShoppingCart, title: "Online buyers", desc: "Check product photos and reviews for synthetic content before you pay." },
  { icon: Scale, title: "Legal & compliance", desc: "Flag AI-authored statements and document exhibits during discovery." },
  { icon: Heart, title: "Dating & social", desc: "Detect fake profile pics and AI-generated bios before you swipe right." },
];

const UseCases = () => (
  <section className="mt-12">
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold">Who's using it</h3>
      <p className="text-sm text-muted-foreground mt-1">Built for anyone who needs to trust what they read, see or watch.</p>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {cases.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0">
              <Icon className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-sm">{title}</div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default UseCases;
