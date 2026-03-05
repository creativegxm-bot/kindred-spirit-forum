import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Plus, Filter, Clock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { format } from "date-fns";

const JobSeekers = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isTr = language === "tr";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterJobType, setFilterJobType] = useState<string>("all");
  const [form, setForm] = useState({
    title: "", company: "", description: "", location: "", job_type: "full-time",
    salary_min: "", salary_max: "", currency: "USD", listing_type: "seeking",
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["job-listings", language, filterType, filterJobType],
    queryFn: async () => {
      let q = (supabase.from("job_listings" as any).select("*") as any)
        .eq("is_active", true).eq("language_code", language).order("created_at", { ascending: false });
      if (filterType !== "all") q = q.eq("listing_type", filterType);
      if (filterJobType !== "all") q = q.eq("job_type", filterJobType);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");
      const { error } = await (supabase.from("job_listings" as any).insert as any)({
        user_id: user.id, title: form.title, company: form.company || null,
        description: form.description, location: form.location, job_type: form.job_type,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        currency: form.currency, listing_type: form.listing_type, language_code: language,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(isTr ? "İlan oluşturuldu!" : "Listing created!");
      queryClient.invalidateQueries({ queryKey: ["job-listings"] });
      setDialogOpen(false);
      setForm({ title: "", company: "", description: "", location: "", job_type: "full-time", salary_min: "", salary_max: "", currency: "USD", listing_type: "seeking" });
    },
    onError: () => toast.error(isTr ? "Bir hata oluştu" : "Something went wrong"),
  });

  const jobTypeLabel = (type: string) => {
    const map: Record<string, string> = isTr
      ? { "full-time": "Tam Zamanlı", "part-time": "Yarı Zamanlı", "contract": "Sözleşmeli", "freelance": "Serbest" }
      : { "full-time": "Full-time", "part-time": "Part-time", "contract": "Contract", "freelance": "Freelance" };
    return map[type] || type;
  };

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
          <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-3">
            <Briefcase className="h-9 w-9" />
            {isTr ? "İş İlanları" : "Job Board"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {isTr ? "İş arayan veya işe alım yapan ilanları keşfedin." : "Browse listings from job seekers and employers."}
          </p>
        </div>

        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isTr ? "Tümü" : "All"}</SelectItem>
                <SelectItem value="seeking">{isTr ? "İş Arıyor" : "Seeking"}</SelectItem>
                <SelectItem value="hiring">{isTr ? "İşe Alıyor" : "Hiring"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterJobType} onValueChange={setFilterJobType}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isTr ? "Tüm Türler" : "All Types"}</SelectItem>
                <SelectItem value="full-time">{isTr ? "Tam Zamanlı" : "Full-time"}</SelectItem>
                <SelectItem value="part-time">{isTr ? "Yarı Zamanlı" : "Part-time"}</SelectItem>
                <SelectItem value="contract">{isTr ? "Sözleşmeli" : "Contract"}</SelectItem>
                <SelectItem value="freelance">{isTr ? "Serbest" : "Freelance"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!user}>
                <Plus className="h-4 w-4" />
                {isTr ? "İlan Ver" : "Post Listing"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{isTr ? "Yeni İş İlanı" : "New Job Listing"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder={isTr ? "Pozisyon başlığı" : "Job title"} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Input placeholder={isTr ? "Şirket (opsiyonel)" : "Company (optional)"} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                <Textarea placeholder={isTr ? "Açıklama" : "Description"} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} />
                <Input placeholder={isTr ? "Konum" : "Location"} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={form.job_type} onValueChange={v => setForm(f => ({ ...f, job_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">{isTr ? "Tam Zamanlı" : "Full-time"}</SelectItem>
                      <SelectItem value="part-time">{isTr ? "Yarı Zamanlı" : "Part-time"}</SelectItem>
                      <SelectItem value="contract">{isTr ? "Sözleşmeli" : "Contract"}</SelectItem>
                      <SelectItem value="freelance">{isTr ? "Serbest" : "Freelance"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={form.listing_type} onValueChange={v => setForm(f => ({ ...f, listing_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seeking">{isTr ? "İş Arıyorum" : "Seeking Job"}</SelectItem>
                      <SelectItem value="hiring">{isTr ? "İşe Alıyorum" : "Hiring"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" placeholder={isTr ? "Min maaş" : "Min salary"} value={form.salary_min} onChange={e => setForm(f => ({ ...f, salary_min: e.target.value }))} />
                  <Input type="number" placeholder={isTr ? "Max maaş" : "Max salary"} value={form.salary_max} onChange={e => setForm(f => ({ ...f, salary_max: e.target.value }))} />
                  <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!form.title || !form.description || !form.location || createMutation.isPending}>
                  {createMutation.isPending ? (isTr ? "Gönderiliyor..." : "Posting...") : (isTr ? "İlanı Yayınla" : "Publish Listing")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!user && (
          <div className="rounded-xl border border-border bg-card p-4 mb-6 text-center text-muted-foreground">
            {isTr ? "İlan vermek için giriş yapın." : "Log in to post a listing."}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">{isTr ? "Yükleniyor..." : "Loading..."}</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{isTr ? "Henüz ilan yok." : "No listings yet."}</div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing: any) => (
              <div key={listing.id} className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={listing.listing_type === "seeking" ? "default" : "secondary"}>
                    {listing.listing_type === "seeking" ? (isTr ? "İş Arıyor" : "Seeking") : (isTr ? "İşe Alıyor" : "Hiring")}
                  </Badge>
                  <Badge variant="outline">{jobTypeLabel(listing.job_type)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(listing.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                {listing.company && (
                  <p className="text-sm text-primary flex items-center gap-1 mb-1"><Building className="h-3.5 w-3.5" />{listing.company}</p>
                )}
                <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{listing.description}</p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{listing.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{jobTypeLabel(listing.job_type)}</span>
                  {(listing.salary_min || listing.salary_max) && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {listing.salary_min && listing.salary_max
                        ? `${listing.salary_min}-${listing.salary_max} ${listing.currency}`
                        : listing.salary_max ? `${isTr ? "Max" : "Up to"} ${listing.salary_max} ${listing.currency}` : `${listing.salary_min}+ ${listing.currency}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default JobSeekers;
