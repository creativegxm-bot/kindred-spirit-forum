import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { Twitter, Instagram, Github } from "lucide-react";
import ondabirLogo from "@/assets/ondabir-logo.png";

const Footer = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const sections = [
    {
      title: isTr ? "ondabir Bilgi" : "ondabir Info",
      links: [
        { label: isTr ? "Hakkımızda" : "About Us", to: "/about" },
        { label: isTr ? "Güvenlik ve Güven" : "Security & Trust", to: "/security" },
        { label: isTr ? "Yardım ve Destek" : "Help & Support", to: "/help" },
        { label: isTr ? "Kariyer" : "Jobs", to: "/jobs" },
        { label: isTr ? "Editöryal Kılavuzlar" : "Editorial Guidelines", to: "/editorial" },
        { label: isTr ? "Yazılımınızı Ekleyin" : "Add Your Software", to: "/add-software" },
      ],
    },
    {
      title: isTr ? "İş İçin" : "For Business",
      links: [
        { label: isTr ? "Reklam" : "Advertising", to: "/advertise" },
        { label: isTr ? "Gelir Çözümleri" : "Monetization", to: "/monetization" },
        { label: isTr ? "Yazılım Yönetimi" : "Software Management", to: "/add-software" },
        { label: isTr ? "Yazılım Politikası" : "Software Policy", to: "/software-policy" },
        { label: isTr ? "Reklam Fırsatları" : "Ad Opportunities", to: "/ad-opportunities" },
      ],
    },
    {
      title: isTr ? "Yasal" : "Legal",
      links: [
        { label: "DMCA", to: "/dmca" },
        { label: isTr ? "Yasal Bilgiler" : "Legal Info", to: "/legal" },
        { label: isTr ? "Kullanım Koşulları" : "Terms of Use", to: "/terms" },
        { label: isTr ? "Gizlilik Politikası" : "Privacy Policy", to: "/privacy" },
        { label: isTr ? "Çerez Politikası" : "Cookie Policy", to: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="container max-w-6xl py-10 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to={localePath("/")} className="flex items-center gap-2 mb-3">
              <img src={ondabirLogo} alt="ondabir" className="h-8 w-8 rounded" />
              <span className="text-xl font-bold text-primary">ondabir</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isTr
                ? "Dünya genelinde insanları bir araya getiren çok dilli topluluk platformu."
                : "A multilingual community platform bringing people together worldwide."}
            </p>
          </div>

          {/* Link sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={localePath(link.to)}
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} ondabir. {isTr ? "Tüm hakları saklıdır." : "All rights reserved."}
          </p>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com/ondabir" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter size={18} />
            </a>
            <a href="https://instagram.com/ondabir" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://github.com/ondabir" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Github size={18} />
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to={localePath("/privacy")} className="hover:text-primary transition-colors">{isTr ? "Gizlilik" : "Privacy"}</Link>
            <Link to={localePath("/terms")} className="hover:text-primary transition-colors">{isTr ? "Koşullar" : "Terms"}</Link>
            <Link to={localePath("/cookies")} className="hover:text-primary transition-colors">{isTr ? "Çerezler" : "Cookies"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
