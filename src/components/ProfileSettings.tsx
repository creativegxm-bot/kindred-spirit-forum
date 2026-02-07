import { useState, useEffect } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useCountry } from "@/hooks/useCountry";
import { COUNTRIES } from "@/components/CountryFilter";
import { Language } from "@/i18n/translations";

const LANGUAGES: { code: Language; name: string }[] = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिंदी" },
  { code: "ja", name: "日本語" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "it", name: "Italiano" },
];

const ProfileSettings = () => {
  const { profile } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [open, setOpen] = useState(false);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [preferredCountry, setPreferredCountry] = useState(profile?.preferred_country || selectedCountry);
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(
    (profile?.preferred_language as Language) || language
  );

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setPreferredCountry(profile.preferred_country || selectedCountry);
      setPreferredLanguage((profile.preferred_language as Language) || language);
    }
  }, [profile, selectedCountry, language]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName || undefined,
        bio: bio || undefined,
        avatar_url: avatarUrl || undefined,
        preferred_country: preferredCountry,
        preferred_language: preferredLanguage,
      });

      // Apply preferences immediately
      setSelectedCountry(preferredCountry);
      setLanguage(preferredLanguage);

      toast({
        title: "Profil güncellendi",
        description: "Değişiklikleriniz kaydedildi",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenemedi",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Profili Düzenle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profili Düzenle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Görünen Ad</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Görünen adınız"
              className="bg-secondary border-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biyografi</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kendinizden bahsedin..."
              className="bg-secondary border-none resize-none min-h-24"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://ornek.com/avatar.png"
              className="bg-secondary border-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Tercih Edilen Ülke</Label>
            <Select value={preferredCountry} onValueChange={setPreferredCountry}>
              <SelectTrigger className="bg-secondary border-none">
                <SelectValue placeholder="Ülke seçin" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tercih Edilen Dil</Label>
            <Select value={preferredLanguage} onValueChange={(val) => setPreferredLanguage(val as Language)}>
              <SelectTrigger className="bg-secondary border-none">
                <SelectValue placeholder="Dil seçin" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full gap-2"
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Değişiklikleri Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;
