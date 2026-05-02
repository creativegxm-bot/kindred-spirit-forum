import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: "website" | "article";
  image?: string;
}

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [key, val] = selector.replace("meta[", "").replace("]", "").split("=");
    el.setAttribute(key, val.replace(/"/g, ""));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const SEO = ({ title, description, canonical, ogType = "website", image }: SEOProps) => {
  useEffect(() => {
    const fullTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
    const desc = description.length > 160 ? description.slice(0, 157) + "..." : description;
    const url = canonical || window.location.href;
    const img = image || "https://ondabir.com/og-image.png";

    document.title = fullTitle;
    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[property="og:type"]', "content", ogType);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:image"]', "content", img);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", desc);
    setMeta('meta[name="twitter:image"]', "content", img);
    setLink("canonical", url);
  }, [title, description, canonical, ogType, image]);

  return null;
};

export default SEO;
