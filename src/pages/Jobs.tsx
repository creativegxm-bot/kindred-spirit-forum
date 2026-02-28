import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Briefcase, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const Jobs = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const jobs = [
    { title: isTr ? "Kıdemli Frontend Geliştirici" : "Senior Frontend Developer", location: isTr ? "Uzaktan" : "Remote", type: isTr ? "Tam Zamanlı" : "Full-time", dept: "Engineering" },
    { title: isTr ? "Backend Mühendisi" : "Backend Engineer", location: isTr ? "Uzaktan" : "Remote", type: isTr ? "Tam Zamanlı" : "Full-time", dept: "Engineering" },
    { title: isTr ? "İçerik Moderatörü" : "Content Moderator", location: isTr ? "Uzaktan" : "Remote", type: isTr ? "Yarı Zamanlı" : "Part-time", dept: isTr ? "Operasyon" : "Operations" },
    { title: isTr ? "Ürün Tasarımcısı" : "Product Designer", location: isTr ? "Uzaktan" : "Remote", type: isTr ? "Tam Zamanlı" : "Full-time", dept: isTr ? "Tasarım" : "Design" },
    { title: isTr ? "Topluluk Yöneticisi" : "Community Manager", location: isTr ? "Uzaktan" : "Remote", type: isTr ? "Tam Zamanlı" : "Full-time", dept: isTr ? "Pazarlama" : "Marketing" },
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

        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl font-bold text-primary">{isTr ? "Kariyer" : "Jobs"}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {isTr
              ? "ondabir ekibine katılın ve geleceğin topluluk platformunu birlikte inşa edelim."
              : "Join the ondabir team and help us build the community platform of the future."}
          </p>
        </div>

        <div className="space-y-4">
          {jobs.map((job, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 flex items-center justify-between hover:border-primary/40 transition-colors">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.dept}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.type}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">{isTr ? "Başvur" : "Apply"}</Button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">
            {isTr
              ? "Aradığınız pozisyonu bulamadınız mı? Özgeçmişinizi careers@ondabir.com adresine gönderin."
              : "Didn't find the right position? Send your resume to careers@ondabir.com"}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
