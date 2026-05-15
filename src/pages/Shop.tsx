import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, MessageSquare, ExternalLink, Search, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ShopInquiryForm from "@/components/ShopInquiryForm";
import { wholesaleProducts } from "@/data/wholesaleProducts";

const CONTACT_PHONE = "908-987-7387";
const CONTACT_TEL = "+19089877387";

const Shop = () => {
  const [query, setQuery] = useState("");
  const [inquiryProduct, setInquiryProduct] = useState<string>("");
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const openInquiry = (productTitle: string) => {
    setInquiryProduct(productTitle);
    setFormKey((k) => k + 1);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const [activeCat, setActiveCat] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    wholesaleProducts.forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return wholesaleProducts.filter((p) => {
      if (activeCat !== "All" && p.category !== activeCat) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [query, activeCat]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Wholesale Shop — Bulk Socks, Hats & Gloves | ondabir"
        description="Browse 50+ wholesale products: socks, cuff hats, gloves & accessories. US-based bulk supplier. Call or text 908-987-7387 for quotes."
        canonical="https://ondabir.com/shop"
      />

      <div className="container max-w-7xl py-6 px-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Home
          </Button>
        </Link>

        <header className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Wholesale Shop</h1>
          <p className="text-muted-foreground mb-4 max-w-2xl">
            US-based bulk supplier of quality socks, hats, gloves and accessories. Browse the catalog
            below and contact us directly for pricing, MOQ and shipping.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${CONTACT_TEL}`}>
              <Button className="gap-2"><Phone className="h-4 w-4" /> Call {CONTACT_PHONE}</Button>
            </a>
            <a href={`sms:${CONTACT_TEL}`}>
              <Button variant="secondary" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Text {CONTACT_PHONE}
              </Button>
            </a>
          </div>
        </header>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  activeCat === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-3 text-sm text-muted-foreground">
          Showing {filtered.length} of {wholesaleProducts.length} products
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <article
              key={p.slug}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50 hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Badge variant="secondary" className="w-fit text-[10px]">{p.category}</Badge>
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{p.title}</h3>
                <p className="line-clamp-3 text-xs text-muted-foreground">{p.description}</p>
                <div className="mt-auto flex flex-col gap-1.5 pt-2">
                  <Button
                    size="sm"
                    onClick={() => openInquiry(p.title)}
                    className="h-8 w-full gap-1.5 text-xs"
                  >
                    <Send className="h-3.5 w-3.5" /> Inquire
                  </Button>
                  <div className="grid grid-cols-3 gap-1.5">
                    <a href={`tel:${CONTACT_TEL}`}>
                      <Button variant="secondary" size="sm" className="h-8 w-full gap-1 text-[11px]">
                        <Phone className="h-3 w-3" /> Call
                      </Button>
                    </a>
                    <a href={`sms:${CONTACT_TEL}?&body=${encodeURIComponent("Inquiry about: " + p.title)}`}>
                      <Button variant="secondary" size="sm" className="h-8 w-full gap-1 text-[11px]">
                        <MessageSquare className="h-3 w-3" /> Text
                      </Button>
                    </a>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8 w-full gap-1 text-[11px]">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No products match your search.
          </div>
        )}

        <div ref={formRef} className="mt-10 scroll-mt-20">
          <ShopInquiryForm key={formKey} defaultProduct={inquiryProduct} />
        </div>

        <section className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <h2 className="mb-2 text-xl font-bold">Ready to order in bulk?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Call or text us with your product, quantity and shipping zip — we'll get back fast.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={`tel:${CONTACT_TEL}`}>
              <Button className="gap-2"><Phone className="h-4 w-4" /> Call {CONTACT_PHONE}</Button>
            </a>
            <a href={`sms:${CONTACT_TEL}`}>
              <Button variant="secondary" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Text {CONTACT_PHONE}
              </Button>
            </a>
            <a href="mailto:info@bulkwholesaleusa.com">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" /> Email
              </Button>
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
