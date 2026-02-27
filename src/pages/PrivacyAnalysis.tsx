import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, TrendingUp, Users, Globe, Lock, Brain, BarChart3, Shield, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";

const stats = [
  { label: "Daily Global Visits", labelTr: "Günlük Küresel Ziyaret", value: "4.5B+", icon: Globe, color: "text-blue-500" },
  { label: "Incognito Usage Rate", labelTr: "Gizli Mod Kullanım Oranı", value: "76%", icon: EyeOff, color: "text-purple-500" },
  { label: "Average Session Time", labelTr: "Ortalama Oturum Süresi", value: "10 min", icon: BarChart3, color: "text-green-500" },
  { label: "Mobile Traffic Share", labelTr: "Mobil Trafik Payı", value: "83%", icon: Smartphone, color: "text-orange-500" },
];

const sections = [
  {
    id: "traffic",
    title: "Why Adult Websites Receive Massive Traffic",
    titleTr: "Yetişkin Web Siteleri Neden Bu Kadar Fazla Ziyaret Alıyor",
    icon: TrendingUp,
    color: "text-red-500",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    points: [
      {
        heading: "Biological Drivers",
        headingTr: "Biyolojik Faktörler",
        text: "Human sexuality is a fundamental biological drive. Research published in neuroscience journals indicates that the brain's reward system responds strongly to novel sexual stimuli, releasing dopamine in patterns similar to other reward-seeking behaviors. This biological wiring ensures consistent demand across all demographics.",
        textTr: "İnsan cinselliği temel bir biyolojik dürtüdür. Nörobilim dergilerinde yayınlanan araştırmalar, beynin ödül sisteminin yeni cinsel uyaranlara güçlü tepki verdiğini ve diğer ödül arama davranışlarına benzer kalıplarda dopamin salgıladığını göstermektedir.",
      },
      {
        heading: "Accessibility & Anonymity",
        headingTr: "Erişilebilirlik ve Anonimlik",
        text: "The 'Triple-A Engine' model (Accessibility, Affordability, Anonymity) proposed by researcher Al Cooper explains why internet-based adult content surpassed all previous distribution methods. Free access, 24/7 availability, and perceived privacy removed every traditional barrier.",
        textTr: "Araştırmacı Al Cooper tarafından önerilen 'Üçlü-A Motoru' modeli (Erişilebilirlik, Uygun Fiyat, Anonimlik), internet tabanlı yetişkin içeriğin önceki tüm dağıtım yöntemlerini neden aştığını açıklar.",
      },
      {
        heading: "Global Scale & Demographics",
        headingTr: "Küresel Ölçek ve Demografi",
        text: "Annual industry reports show that adult websites collectively receive more monthly traffic than Netflix, Amazon, and Twitter combined. The audience spans all age groups (18+), genders, relationship statuses, and socioeconomic backgrounds, making it one of the most universally consumed content categories online.",
        textTr: "Yıllık sektör raporları, yetişkin web sitelerinin toplu olarak Netflix, Amazon ve Twitter'ın toplamından daha fazla aylık trafik aldığını göstermektedir.",
      },
    ],
  },
  {
    id: "psychology",
    title: "The Psychology Behind the Behavior",
    titleTr: "Davranışın Arkasındaki Psikoloji",
    icon: Brain,
    color: "text-violet-500",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=400&fit=crop",
    points: [
      {
        heading: "Curiosity & Novelty Seeking",
        headingTr: "Merak ve Yenilik Arayışı",
        text: "Psychologists identify novelty-seeking as a core human trait. The virtually unlimited variety of content online triggers the brain's exploratory mechanisms. Studies show that the anticipation of new content activates reward pathways more than the content itself—a phenomenon known as the 'seeking system.'",
        textTr: "Psikologlar yenilik arayışını temel bir insan özelliği olarak tanımlar. Çevrimiçi içeriğin neredeyse sınırsız çeşitliliği, beynin keşif mekanizmalarını tetikler.",
      },
      {
        heading: "Stress Relief & Escapism",
        headingTr: "Stres Azaltma ve Kaçış",
        text: "Research from multiple universities indicates that a significant portion of users report visiting adult sites as a form of stress relief or emotional regulation. The temporary mood boost follows similar neurochemical patterns observed in other comfort-seeking behaviors.",
        textTr: "Birden fazla üniversitenin araştırmaları, kullanıcıların önemli bir kısmının stres azaltma veya duygusal düzenleme amacıyla yetişkin siteleri ziyaret ettiğini bildirmektedir.",
      },
      {
        heading: "Social Taboo Effect",
        headingTr: "Sosyal Tabu Etkisi",
        text: "Paradoxically, the social stigma surrounding adult content consumption increases its psychological appeal. The 'forbidden fruit' effect, well-documented in behavioral psychology, suggests that societal disapproval can amplify desire rather than diminish it.",
        textTr: "Paradoks olarak, yetişkin içerik tüketimine yönelik sosyal damga, psikolojik çekiciliğini artırır. Davranışsal psikolojide iyi belgelenmiş 'yasak meyve' etkisi, toplumsal onaylamazlığın arzuyu azaltmak yerine artırabileceğini öne sürer.",
      },
    ],
  },
  {
    id: "incognito",
    title: "Why Incognito Mode is Preferred",
    titleTr: "Neden Gizli Mod Tercih Ediliyor",
    icon: EyeOff,
    color: "text-emerald-500",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
    points: [
      {
        heading: "Privacy from Shared Devices",
        headingTr: "Paylaşılan Cihazlarda Gizlilik",
        text: "Surveys consistently show that the #1 reason for incognito usage is preventing browsing history from appearing on shared computers, tablets, or phones. Family members, partners, or colleagues may have access to the same device, creating a practical need for history-free browsing.",
        textTr: "Anketler sürekli olarak gizli mod kullanımının en önemli nedeninin tarama geçmişinin paylaşılan bilgisayarlarda, tabletlerde veya telefonlarda görünmesini engellemek olduğunu göstermektedir.",
      },
      {
        heading: "Avoiding Targeted Advertising",
        headingTr: "Hedefli Reklamlardan Kaçınma",
        text: "Users are increasingly aware that browsing behavior feeds advertising algorithms. Incognito mode prevents cookies from building a profile that could lead to embarrassing targeted ads appearing during work presentations, family browsing, or social media use.",
        textTr: "Kullanıcılar, tarama davranışının reklam algoritmalarını beslediğinin giderek daha fazla farkındadır. Gizli mod, çerezlerin utanç verici hedefli reklamlara yol açabilecek bir profil oluşturmasını engeller.",
      },
      {
        heading: "Psychological Comfort of 'Clean Slate'",
        headingTr: "Temiz Sayfa'nın Psikolojik Rahatlığı",
        text: "Beyond practical privacy, incognito mode provides psychological comfort—a sense that the activity 'didn't happen' digitally. Behavioral researchers note this mirrors the human tendency to compartmentalize behaviors that conflict with our public self-image, even when no one else would see the history.",
        textTr: "Pratik gizliliğin ötesinde, gizli mod psikolojik rahatlık sağlar—aktivitenin dijital olarak 'olmadığı' hissi. Davranışsal araştırmacılar bunun, kimsenin geçmişi görmeyeceği durumlarda bile kamusal benlik imajımızla çelişen davranışları bölümleme eğilimimizi yansıttığını belirtir.",
      },
      {
        heading: "Misconceptions About True Privacy",
        headingTr: "Gerçek Gizlilik Hakkındaki Yanlış Kavramalar",
        text: "Notably, studies reveal that many users overestimate incognito mode's protection. While it prevents local history storage, it does NOT hide activity from ISPs, network administrators, or the websites themselves. Despite this, the perceived privacy is sufficient to drive adoption, highlighting how privacy is as much a psychological need as a technical one.",
        textTr: "Dikkat çekici bir şekilde, çalışmalar birçok kullanıcının gizli modun korumasını abarttığını ortaya koymaktadır. Yerel geçmiş depolamasını engellerken, İSS'lerden, ağ yöneticilerinden veya web sitelerinden aktiviteyi GİZLEMEZ.",
      },
    ],
  },
  {
    id: "data",
    title: "What the Data Tells Us",
    titleTr: "Veriler Bize Ne Söylüyor",
    icon: BarChart3,
    color: "text-amber-500",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    points: [
      {
        heading: "Peak Hours Mirror Human Routines",
        headingTr: "Zirve Saatleri İnsan Rutinlerini Yansıtıyor",
        text: "Traffic analytics reveal predictable patterns: usage peaks between 10 PM and 1 AM local time across all regions, with a secondary peak during early afternoon. These patterns align with periods of solitude and lowered social accountability, reinforcing the privacy-driven nature of consumption.",
        textTr: "Trafik analitiği öngörülebilir kalıplar ortaya koyar: kullanım tüm bölgelerde yerel saate göre 22:00-01:00 arasında zirve yapar ve erken öğleden sonra ikincil bir zirve görülür.",
      },
      {
        heading: "Cultural Variations",
        headingTr: "Kültürel Farklılıklar",
        text: "Interestingly, countries with stricter social norms around sexuality often show higher per-capita consumption rates. This inverse relationship between restriction and consumption is consistent across multiple data sets and supports the 'forbidden fruit' hypothesis discussed earlier.",
        textTr: "İlginç bir şekilde, cinsellik konusunda daha katı sosyal normlara sahip ülkeler genellikle kişi başına daha yüksek tüketim oranları göstermektedir.",
      },
      {
        heading: "The VPN & Privacy Tool Correlation",
        headingTr: "VPN ve Gizlilik Araçları Korelasyonu",
        text: "VPN usage statistics show a strong correlation with adult content consumption. In regions where such content faces restrictions, VPN adoption rates are significantly higher—further demonstrating that demand persists regardless of accessibility barriers, and users will actively seek privacy-enhancing tools.",
        textTr: "VPN kullanım istatistikleri, yetişkin içerik tüketimi ile güçlü bir korelasyon göstermektedir. Bu tür içeriğin kısıtlamalarla karşılaştığı bölgelerde VPN benimseme oranları önemli ölçüde daha yüksektir.",
      },
    ],
  },
];

const PrivacyAnalysis = () => {
  const { language } = useLanguage();
  const { localePath } = useLocalizedNavigate();
  const isTr = language === "tr";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        {/* Back Button */}
        <Link to={localePath("/")}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isTr ? "Ana Sayfa" : "Home"}
          </Button>
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <img
              src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=500&fit=crop"
              alt="Digital privacy analysis"
              className="w-full h-64 md:h-80 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {isTr ? "Derinlemesine Analiz" : "Deep Analysis"}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
                {isTr
                  ? "Yetişkin Web Siteleri Neden Bu Kadar Çok Ziyaret Alıyor? İnsan Davranışı ve Gizli Mod Analizi"
                  : "Why Do Adult Websites Get So Much Traffic? A Human Behavior & Incognito Mode Analysis"}
              </h1>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
                {isTr
                  ? "İnternet trafiğinin en büyük dilimlerinden birinin psikolojik, sosyolojik ve teknolojik nedenlerini inceleyen kapsamlı bir analiz."
                  : "A comprehensive look at the psychological, sociological, and technological factors behind one of the internet's largest traffic categories."}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-5 pb-4">
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isTr ? stat.labelTr : stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table of Contents */}
        <Card className="mb-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {isTr ? "İçindekiler" : "Table of Contents"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span>
                  {i + 1}. {isTr ? s.titleTr : s.title}
                </span>
              </a>
            ))}
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="flex flex-col gap-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <div className="rounded-xl overflow-hidden mb-5">
                <img
                  src={section.image}
                  alt={isTr ? section.titleTr : section.title}
                  className="w-full h-48 md:h-56 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <section.icon className={`h-6 w-6 ${section.color}`} />
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {isTr ? section.titleTr : section.title}
                </h2>
              </div>
              <div className="flex flex-col gap-5">
                {section.points.map((point) => (
                  <Card key={point.heading}>
                    <CardContent className="pt-5">
                      <h3 className="font-semibold text-foreground mb-2">
                        {isTr ? point.headingTr : point.heading}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {isTr ? point.textTr : point.text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Disclaimer */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {isTr ? "Sorumluluk Reddi" : "Disclaimer"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isTr
                    ? "Bu makale yalnızca eğitim ve analiz amaçlıdır. Sunulan veriler kamuya açık sektör raporlarından ve akademik araştırmalardan derlenmiştir. Bu içerik herhangi bir web sitesini veya davranışı teşvik etmemektedir."
                    : "This article is for educational and analytical purposes only. Data presented is compiled from publicly available industry reports and academic research. This content does not endorse or promote any website or behavior."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyAnalysis;
