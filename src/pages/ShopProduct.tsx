import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageSquare, ExternalLink, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ShopInquiryForm from "@/components/ShopInquiryForm";
import { LanguageProvider } from "@/hooks/useLanguage";
import { wholesaleProducts } from "@/data/wholesaleProducts";

const CONTACT_PHONE = "908-987-7387";
const CONTACT_TEL = "+19089877387";

const parseSpecs = (description: string) => {
  // Split on " Key: value Key: value" patterns
  const regex = /([A-Z][A-Za-z ]+?):\s*([^:]+?)(?=\s+[A-Z][A-Za-z ]+?:|$)/g;
  const out: { label: string; value: string }[] = [];
  let m;
  while ((m = regex.exec(description)) !== null) {
    const label = m[1].trim();
    const value = m[2].trim().replace(/\s+/g, " ");
    if (value) out.push({ label, value });
  }
  return out;
};

const ShopProduct = () => {
  const { slug } = useParams();
  const product = useMemo(
    () => wholesaleProducts.find((p) => p.slug === slug),
    [slug]
  );

  if (!product) return <Navigate to="/shop" replace />;

  const specs = useMemo(() => parseSpecs(product.description), [product]);
  const related = useMemo(
    () =>
      wholesaleProducts
        .filter((p) => p.category === product.category && p.slug !== product.slug)
        .slice(0, 8),
    [product]
  );

  const inquiryBody = encodeURIComponent("Inquiry about: " + product.title);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${product.title} — Wholesale ${product.category} | ondabir`}
        description={`${product.title}. Bulk ${product.category.toLowerCase()} wholesale. Call or text ${CONTACT_PHONE} for pricing & MOQ.`}
        canonical={`https://ondabir.com/shop/${product.slug}`}
      />

      <div className="container max-w-5xl py-6 px-4">
        <Link to="/shop">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Button>
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Badge variant="secondary" className="w-fit">{product.category}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>

            {specs.length > 0 ? (
              <dl className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-card p-4 text-sm">
                {specs.map((s, i) => (
                  <div key={i} className="flex justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="text-right font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">{product.description}</p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <a href={`tel:${CONTACT_TEL}`}>
                <Button className="gap-2"><Phone className="h-4 w-4" /> Call {CONTACT_PHONE}</Button>
              </a>
              <a href={`sms:${CONTACT_TEL}?&body=${inquiryBody}`}>
                <Button variant="secondary" className="gap-2">
                  <MessageSquare className="h-4 w-4" /> Text
                </Button>
              </a>
              <a href={`mailto:info@bulkwholesaleusa.com?subject=${inquiryBody}`}>
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Button>
              </a>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Source
                </Button>
              </a>
            </div>

            <a href={`#inquiry`}>
              <Button size="lg" className="mt-2 w-full gap-2">
                <Send className="h-4 w-4" /> Request a Quote
              </Button>
            </a>
          </div>
        </div>

        <div id="inquiry" className="mt-10 scroll-mt-20">
          <ShopInquiryForm defaultProduct={product.title} />
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">More in {product.category}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to={`/shop/${p.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="p-2">
                    <h3 className="line-clamp-2 text-xs font-semibold">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    </div>
  );
};

export default ShopProduct;
