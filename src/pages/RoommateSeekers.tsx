import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Home, MapPin, DollarSign, Calendar, Plus, Filter } from "lucide-react";
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

const RoommateSeekers = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isTr = language === "tr";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [form, setForm] = useState({
    title: "", description: "", location: "", budget_min: "", budget_max: "",
    currency: "USD", move_in_date: "", listing_type: "seeking",
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["roommate-listings", language, filterType],
    queryFn: async () => {
      let q = (supabase.from("roommate_listings" as any).select("*") as any)
        .eq("is_active", true).eq("language_code", language).order("created_at", { ascending: false });
      if (filterType !== "all") q = q.eq("listing_type", filterType);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");
      const { error } = await (supabase.from("roommate_listings" as any).insert as any)({
        user_id: user.id, title: form.title, description: form.description,
        location: form.location, budget_min: form.budget_min ? parseInt(form.budget_min) : null,
        budget_max: form.budget_max ? parseInt(form.budget_max) : null,
        currency: form.currency, move_in_date: form.move_in_date || null,
        listing_type: form.listing_type, language_code: language,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(isTr ? "İlan oluşturuldu!" : "Listing created!");
      queryClient.invalidateQueries({ queryKey: ["roommate-listings"] });
      setDialogOpen(false);
      setForm({ title: "", description: "", location: "", budget_min: "", budget_max: "", currency: "USD", move_in_date: "", listing_type: "seeking" });
    },
    onError: () => toast.error(isTr ? "Bir hata oluştu" : "Something went wrong"),
  });

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
            <Home className="h-9 w-9" />
            {isTr ? "Ev Arkadaşı Bul" : "Find a Roommate"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {isTr ? "Ev arkadaşı arayan veya oda sunan ilanları keşfedin." : "Browse listings from people seeking roommates or offering rooms."}
          </p>
        </div>

        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isTr ? "Tümü" : "All"}</SelectItem>
                <SelectItem value="seeking">{isTr ? "Arıyor" : "Seeking"}</SelectItem>
                <SelectItem value="offering">{isTr ? "Sunuyor" : "Offering"}</SelectItem>
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
                <DialogTitle>{isTr ? "Yeni İlan" : "New Listing"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder={isTr ? "Başlık" : "Title"} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder={isTr ? "Açıklama" : "Description"} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} />
                <Input placeholder={isTr ? "Konum" : "Location"} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" placeholder={isTr ? "Min bütçe" : "Min budget"} value={form.budget_min} onChange={e => setForm(f => ({ ...f, budget_min: e.target.value }))} />
                  <Input type="number" placeholder={isTr ? "Max bütçe" : "Max budget"} value={form.budget_max} onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))} />
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
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={form.move_in_date} onChange={e => setForm(f => ({ ...f, move_in_date: e.target.value }))} />
                  <Select value={form.listing_type} onValueChange={v => setForm(f => ({ ...f, listing_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seeking">{isTr ? "Arıyorum" : "Seeking"}</SelectItem>
                      <SelectItem value="offering">{isTr ? "Sunuyorum" : "Offering"}</SelectItem>
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
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={listing.listing_type === "seeking" ? "default" : "secondary"}>
                    {listing.listing_type === "seeking" ? (isTr ? "Arıyor" : "Seeking") : (isTr ? "Sunuyor" : "Offering")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(listing.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{listing.description}</p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{listing.location}</span>
                  {(listing.budget_min || listing.budget_max) && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {listing.budget_min && listing.budget_max
                        ? `${listing.budget_min}-${listing.budget_max} ${listing.currency}`
                        : listing.budget_max ? `${isTr ? "Max" : "Up to"} ${listing.budget_max} ${listing.currency}` : `${listing.budget_min}+ ${listing.currency}`}
                    </span>
                  )}
                  {listing.move_in_date && (
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(listing.move_in_date), "MMM d, yyyy")}</span>
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

export default RoommateSeekers;
