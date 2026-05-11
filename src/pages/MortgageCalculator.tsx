import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home, Calculator, TrendingUp, BookOpen, Clock, ArrowRight, Share2, Check, RotateCcw } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { useToast } from "@/hooks/use-toast";

interface ScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extra: number;
  balance: number;
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const DEFAULTS = {
  homePrice: 400000,
  downPayment: 80000,
  rate: 6.5,
  years: 30,
  propertyTax: 3600,
  insurance: 1200,
  pmi: 0,
  extraMonthly: 0,
};

const numFromParam = (sp: URLSearchParams, key: string, fallback: number) => {
  const v = sp.get(key);
  if (v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const MortgageCalculator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const [homePrice, setHomePrice] = useState(() => numFromParam(searchParams, "price", DEFAULTS.homePrice));
  const [downPayment, setDownPayment] = useState(() => numFromParam(searchParams, "down", DEFAULTS.downPayment));
  const [rate, setRate] = useState(() => numFromParam(searchParams, "rate", DEFAULTS.rate));
  const [years, setYears] = useState(() => numFromParam(searchParams, "years", DEFAULTS.years));
  const [propertyTax, setPropertyTax] = useState(() => numFromParam(searchParams, "tax", DEFAULTS.propertyTax));
  const [insurance, setInsurance] = useState(() => numFromParam(searchParams, "ins", DEFAULTS.insurance));
  const [pmi, setPmi] = useState(() => numFromParam(searchParams, "pmi", DEFAULTS.pmi));
  const [extraMonthly, setExtraMonthly] = useState(() => numFromParam(searchParams, "extra", DEFAULTS.extraMonthly));
  const [showSchedule, setShowSchedule] = useState(false);

  // Sync state -> URL (debounced via effect). Only include non-default values to keep URLs clean.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams();
      const setIf = (key: string, val: number, def: number) => {
        if (val !== def) next.set(key, String(val));
      };
      setIf("price", homePrice, DEFAULTS.homePrice);
      setIf("down", downPayment, DEFAULTS.downPayment);
      setIf("rate", rate, DEFAULTS.rate);
      setIf("years", years, DEFAULTS.years);
      setIf("tax", propertyTax, DEFAULTS.propertyTax);
      setIf("ins", insurance, DEFAULTS.insurance);
      setIf("pmi", pmi, DEFAULTS.pmi);
      setIf("extra", extraMonthly, DEFAULTS.extraMonthly);
      setSearchParams(next, { replace: true });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homePrice, downPayment, rate, years, propertyTax, insurance, pmi, extraMonthly]);

  const shareScenario = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mortgage scenario", url });
        return;
      }
    } catch { /* fall through to clipboard */ }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Share this URL to reopen the same scenario." });
    } catch {
      toast({ title: "Could not copy link", description: url, variant: "destructive" });
    }
  };

  const resetScenario = () => {
    setHomePrice(DEFAULTS.homePrice);
    setDownPayment(DEFAULTS.downPayment);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setPropertyTax(DEFAULTS.propertyTax);
    setInsurance(DEFAULTS.insurance);
    setPmi(DEFAULTS.pmi);
    setExtraMonthly(DEFAULTS.extraMonthly);
  };


  const result = useMemo(() => {
    const principal = Math.max(0, homePrice - downPayment);
    const r = rate / 100 / 12;
    const n = years * 12;
    const basePayment =
      r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const monthlyTax = propertyTax / 12;
    const monthlyIns = insurance / 12;
    const monthlyPmi = pmi / 12;

    const schedule: ScheduleRow[] = [];
    let balance = principal;
    let totalInterest = 0;
    let month = 0;
    while (balance > 0.01 && month < n + 600) {
      month++;
      const interest = balance * r;
      let principalPaid = basePayment - interest;
      let extra = extraMonthly;
      if (principalPaid + extra > balance) {
        extra = Math.max(0, balance - principalPaid);
        if (principalPaid > balance) principalPaid = balance;
      }
      balance = balance - principalPaid - extra;
      totalInterest += interest;
      schedule.push({
        month,
        payment: basePayment + extra,
        principal: principalPaid,
        interest,
        extra,
        balance: Math.max(0, balance),
      });
    }

    const piti = basePayment + monthlyTax + monthlyIns + monthlyPmi;
    return {
      principal,
      basePayment,
      piti,
      monthlyTax,
      monthlyIns,
      monthlyPmi,
      totalInterest,
      totalCost: principal + totalInterest,
      payoffMonths: schedule.length,
      schedule,
    };
  }, [homePrice, downPayment, rate, years, propertyTax, insurance, pmi, extraMonthly]);

  const payoffYears = Math.floor(result.payoffMonths / 12);
  const payoffMonths = result.payoffMonths % 12;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Home className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Mortgage Calculator</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Plan your home loan with confidence
          </h2>
          <p className="text-muted-foreground">
            Calculate monthly payments, total interest, and see how extra payments save you money.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="homePrice">Home Price ($)</Label>
                <Input id="homePrice" type="number" value={homePrice} onChange={(e) => setHomePrice(+e.target.value || 0)} />
              </div>
              <div>
                <Label htmlFor="downPayment">
                  Down Payment ($) — {homePrice ? ((downPayment / homePrice) * 100).toFixed(1) : 0}%
                </Label>
                <Input id="downPayment" type="number" value={downPayment} onChange={(e) => setDownPayment(+e.target.value || 0)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate">Interest Rate (%)</Label>
                  <Input id="rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value || 0)} />
                </div>
                <div>
                  <Label htmlFor="years">Loan Term (years)</Label>
                  <Input id="years" type="number" value={years} onChange={(e) => setYears(+e.target.value || 0)} />
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Taxes & Insurance (annual)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="tax" className="text-xs">Property Tax</Label>
                    <Input id="tax" type="number" value={propertyTax} onChange={(e) => setPropertyTax(+e.target.value || 0)} />
                  </div>
                  <div>
                    <Label htmlFor="ins" className="text-xs">Home Insurance</Label>
                    <Input id="ins" type="number" value={insurance} onChange={(e) => setInsurance(+e.target.value || 0)} />
                  </div>
                  <div>
                    <Label htmlFor="pmi" className="text-xs">PMI</Label>
                    <Input id="pmi" type="number" value={pmi} onChange={(e) => setPmi(+e.target.value || 0)} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <Label htmlFor="extra">Extra Monthly Payment ($)</Label>
                <Input id="extra" type="number" value={extraMonthly} onChange={(e) => setExtraMonthly(+e.target.value || 0)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Monthly Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4 bg-secondary rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Monthly (PITI)</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.piti + extraMonthly)}</div>
              </div>

              <div className="space-y-2 text-sm">
                <Row label="Principal & Interest" value={fmt(result.basePayment)} />
                <Row label="Property Tax" value={fmt(result.monthlyTax)} />
                <Row label="Home Insurance" value={fmt(result.monthlyIns)} />
                <Row label="PMI" value={fmt(result.monthlyPmi)} />
                {extraMonthly > 0 && <Row label="Extra Payment" value={fmt(extraMonthly)} />}
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-sm">
                <Row label="Loan Amount" value={fmt(result.principal)} />
                <Row label="Total Interest" value={fmt(result.totalInterest)} />
                <Row label="Total Cost of Loan" value={fmt(result.totalCost)} />
                <Row
                  label="Payoff Time"
                  value={`${payoffYears}y ${payoffMonths}m`}
                />
              </div>

              <Button className="w-full" onClick={() => setShowSchedule((s) => !s)}>
                {showSchedule ? "Hide" : "Show"} Amortization Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {showSchedule && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Amortization Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="yearly">
                <TabsList>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
                <TabsContent value="yearly">
                  <ScheduleTable rows={aggregateYearly(result.schedule)} isYearly />
                </TabsContent>
                <TabsContent value="monthly">
                  <ScheduleTable rows={result.schedule} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <section className="mt-12">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Mortgage Guides
              </h2>
              <p className="text-sm text-muted-foreground">Tips and explainers to make smarter loan decisions.</p>
            </div>
            <Link to="/blog" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {blogPosts.slice(0, 4).map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`}>
                <Card className="h-full hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Mortgage Calculator. For informational purposes only.
      </footer>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const aggregateYearly = (rows: ScheduleRow[]): ScheduleRow[] => {
  const out: ScheduleRow[] = [];
  for (let i = 0; i < rows.length; i += 12) {
    const chunk = rows.slice(i, i + 12);
    const last = chunk[chunk.length - 1];
    out.push({
      month: Math.ceil((i + 12) / 12),
      payment: chunk.reduce((s, r) => s + r.payment, 0),
      principal: chunk.reduce((s, r) => s + r.principal, 0),
      interest: chunk.reduce((s, r) => s + r.interest, 0),
      extra: chunk.reduce((s, r) => s + r.extra, 0),
      balance: last.balance,
    });
  }
  return out;
};

const ScheduleTable = ({ rows, isYearly }: { rows: ScheduleRow[]; isYearly?: boolean }) => (
  <div className="max-h-[500px] overflow-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{isYearly ? "Year" : "Month"}</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Principal</TableHead>
          <TableHead>Interest</TableHead>
          <TableHead>Extra</TableHead>
          <TableHead>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.month}>
            <TableCell>{r.month}</TableCell>
            <TableCell>{fmt(r.payment)}</TableCell>
            <TableCell>{fmt(r.principal)}</TableCell>
            <TableCell>{fmt(r.interest)}</TableCell>
            <TableCell>{fmt(r.extra)}</TableCell>
            <TableCell>{fmt(r.balance)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default MortgageCalculator;
