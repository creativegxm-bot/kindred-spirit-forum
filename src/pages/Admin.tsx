import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/hooks/useLanguage";
import AdvertiseInquiriesTable from "@/components/admin/AdvertiseInquiriesTable";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { language } = useLanguage();
  const { navigate, localePath } = useLocalizedNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, user, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to={localePath("/")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">
              {language === "tr" ? "Yönetici Paneli" : "Admin Panel"}
            </h1>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">
            {language === "tr" ? "Reklam Başvuruları" : "Advertise Inquiries"}
          </h2>
          <AdvertiseInquiriesTable />
        </section>
      </main>
    </div>
  );
};

export default Admin;
