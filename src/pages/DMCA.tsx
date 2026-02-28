import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const DMCA = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        <Link to={localePath("/")}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isTr ? "Ana Sayfa" : "Home"}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-4">DMCA</h1>
        <p className="text-muted-foreground mb-8">
          {isTr ? "Dijital Milenyum Telif Hakkı Yasası Bildirimi" : "Digital Millennium Copyright Act Notice"}
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">{isTr ? "Telif Hakkı İhlali Bildirimi" : "Copyright Infringement Notice"}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isTr
                ? "ondabir, telif hakkı sahiplerinin haklarına saygı duyar. Telif hakkınızı ihlal eden bir içerik tespit ederseniz, aşağıdaki bilgileri dmca@ondabir.com adresine göndererek bildirimde bulunabilirsiniz."
                : "ondabir respects the rights of copyright holders. If you find content that infringes your copyright, you can submit a notice by sending the following information to dmca@ondabir.com."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">{isTr ? "Gerekli Bilgiler" : "Required Information"}</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
              <li>{isTr ? "Telif hakkı sahibinin veya yetkili temsilcisinin fiziksel veya elektronik imzası" : "Physical or electronic signature of the copyright owner or authorized representative"}</li>
              <li>{isTr ? "İhlal edildiği iddia edilen telif hakkıyla korunan eserin tanımı" : "Description of the copyrighted work claimed to be infringed"}</li>
              <li>{isTr ? "İhlal içeriğinin platformdaki konumu (URL)" : "Location of the infringing content on the platform (URL)"}</li>
              <li>{isTr ? "İletişim bilgileri (ad, adres, telefon, e-posta)" : "Contact information (name, address, phone, email)"}</li>
              <li>{isTr ? "İyi niyet beyanı" : "Good faith statement"}</li>
            </ul>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">{isTr ? "Önemli Uyarı" : "Important Notice"}</h3>
              <p className="text-muted-foreground text-sm">
                {isTr
                  ? "Kasıtlı olarak yanlış DMCA bildirimi göndermek yasal yaptırımlara yol açabilir. Bildirimi göndermeden önce avukatınıza danışmanızı öneririz."
                  : "Submitting a false DMCA notice intentionally may lead to legal consequences. We recommend consulting your attorney before submitting a notice."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2">{isTr ? "İletişim" : "Contact"}</h2>
            <p className="text-muted-foreground text-sm">
              {isTr ? "DMCA bildirimleri için:" : "For DMCA notices:"} <strong>dmca@ondabir.com</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DMCA;
