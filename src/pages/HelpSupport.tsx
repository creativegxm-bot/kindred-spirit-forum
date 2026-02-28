import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, HelpCircle, MessageCircle, Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const HelpSupport = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const faqs = isTr
    ? [
        { q: "Hesap nasıl oluşturulur?", a: "Ana sayfadaki 'Kaydol' butonuna tıklayarak e-posta adresinizle ücretsiz hesap oluşturabilirsiniz." },
        { q: "Topluluk nasıl kurulur?", a: "Sol menüden 'Topluluk Oluştur' butonuna tıklayarak kendi topluluğunuzu kurabilirsiniz." },
        { q: "Şifremi unuttum, ne yapmalıyım?", a: "Giriş ekranında 'Şifremi Unuttum' bağlantısına tıklayarak e-posta ile şifre sıfırlama bağlantısı alabilirsiniz." },
        { q: "İçerik nasıl bildirilir?", a: "Uygunsuz içerik gördüğünüzde gönderi veya yorum altındaki '...' menüsünden 'Bildir' seçeneğini kullanabilirsiniz." },
      ]
    : [
        { q: "How do I create an account?", a: "Click the 'Sign Up' button on the homepage to create a free account with your email address." },
        { q: "How do I create a community?", a: "Click the 'Create Community' button in the left sidebar to start your own community." },
        { q: "I forgot my password, what should I do?", a: "Click the 'Forgot Password' link on the login screen to receive a password reset email." },
        { q: "How do I report content?", a: "When you see inappropriate content, use the '...' menu under the post or comment and select 'Report'." },
      ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        <Link to={localePath("/")}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isTr ? "Ana Sayfa" : "Home"}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-4">
          {isTr ? "Yardım ve Destek" : "Help & Support"}
        </h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: MessageCircle, label: isTr ? "Canlı Sohbet" : "Live Chat", desc: isTr ? "7/24 destek" : "24/7 support" },
            { icon: Mail, label: isTr ? "E-posta" : "Email", desc: "support@ondabir.com" },
            { icon: BookOpen, label: isTr ? "Dökümanlar" : "Documentation", desc: isTr ? "Kapsamlı kılavuzlar" : "Comprehensive guides" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
              <item.icon className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">{item.label}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">
          <HelpCircle className="inline h-6 w-6 text-primary mr-2" />
          {isTr ? "Sık Sorulan Sorular" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-muted-foreground text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpSupport;
