import { useState } from "react";
import { ArrowLeft, Mail, Users, TrendingUp, Target, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

const Advertise = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: language === "tr" ? "Mesajınız gönderildi!" : "Message sent!",
      description: language === "tr" 
        ? "En kısa sürede sizinle iletişime geçeceğiz." 
        : "We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: language === "tr" ? "Aktif Kullanıcı" : "Active Users"
    },
    {
      icon: TrendingUp,
      value: "1M+",
      label: language === "tr" ? "Aylık Görüntülenme" : "Monthly Views"
    },
    {
      icon: Target,
      value: "85%",
      label: language === "tr" ? "Hedef Kitle Erişimi" : "Target Reach"
    }
  ];

  const packages = [
    {
      name: language === "tr" ? "Başlangıç" : "Starter",
      price: language === "tr" ? "₺2,500/ay" : "$250/mo",
      features: [
        language === "tr" ? "Sidebar banner reklamı" : "Sidebar banner ad",
        language === "tr" ? "50.000 gösterim" : "50,000 impressions",
        language === "tr" ? "Temel analitik" : "Basic analytics"
      ]
    },
    {
      name: language === "tr" ? "Profesyonel" : "Professional",
      price: language === "tr" ? "₺7,500/ay" : "$750/mo",
      features: [
        language === "tr" ? "Ana sayfa banner reklamı" : "Homepage banner ad",
        language === "tr" ? "200.000 gösterim" : "200,000 impressions",
        language === "tr" ? "Detaylı analitik" : "Detailed analytics",
        language === "tr" ? "Sponsorlu içerik" : "Sponsored content"
      ],
      popular: true
    },
    {
      name: language === "tr" ? "Kurumsal" : "Enterprise",
      price: language === "tr" ? "Özel Fiyat" : "Custom",
      features: [
        language === "tr" ? "Özel reklam çözümleri" : "Custom ad solutions",
        language === "tr" ? "Sınırsız gösterim" : "Unlimited impressions",
        language === "tr" ? "Özel hesap yöneticisi" : "Dedicated account manager",
        language === "tr" ? "API erişimi" : "API access"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">
            {language === "tr" ? "Bizimle Reklam Verin" : "Advertise With Us"}
          </h1>
        </div>
      </header>

      <main className="container py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-gradient">
            {language === "tr" 
              ? "Hedef Kitlenize Ulaşın" 
              : "Reach Your Target Audience"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === "tr"
              ? "ondabir'de reklam vererek binlerce aktif kullanıcıya ulaşın ve markanızı büyütün."
              : "Advertise on ondabir to reach thousands of active users and grow your brand."}
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-10 w-10 mx-auto text-primary mb-4" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Packages */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-center">
            {language === "tr" ? "Reklam Paketleri" : "Advertising Packages"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <Card 
                key={index} 
                className={pkg.popular ? "border-primary shadow-lg shadow-primary/20" : ""}
              >
                {pkg.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    {language === "tr" ? "En Popüler" : "Most Popular"}
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground">
                    {pkg.price}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="max-w-xl mx-auto space-y-6">
          <h3 className="text-2xl font-bold text-center">
            {language === "tr" ? "Bizimle İletişime Geçin" : "Get In Touch"}
          </h3>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {language === "tr" ? "Adınız" : "Your Name"}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">
                    {language === "tr" ? "Şirket Adı" : "Company Name"}
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">
                    {language === "tr" ? "Mesajınız" : "Your Message"}
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={language === "tr" 
                      ? "Reklam hedeflerinizi ve bütçenizi paylaşın..." 
                      : "Share your advertising goals and budget..."}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  {language === "tr" ? "Mesaj Gönder" : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Advertise;
