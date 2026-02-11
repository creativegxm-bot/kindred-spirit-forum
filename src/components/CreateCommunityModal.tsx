import { useState } from "react";
import { Loader2, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCommunity } from "@/hooks/useCommunities";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES, languageNames } from "@/i18n/languageCountryMapping";
import { Language } from "@/i18n/translations";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

const EMOJI_OPTIONS = [
  "💬", "🎮", "🎵", "🎬", "📚", "💻", "🎨", "⚽", "🏀", "🎾",
  "🚀", "🌍", "🍕", "☕", "🐱", "🐕", "🌸", "🔥", "💡", "⭐",
  "🎯", "🎪", "🏆", "💰", "🔬", "🎭", "📷", "✈️", "🎸", "🎲",
];

const CreateCommunityModal = ({
  isOpen,
  onClose,
  onAuthRequired,
}: CreateCommunityModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💬");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [languageCode, setLanguageCode] = useState<Language>("tr");
  
  const { t, language } = useLanguage();
  const createCommunity = useCreateCommunity();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: language === "tr" ? "Ad gerekli" : "Name required",
        description: language === "tr" ? "Lütfen bir topluluk adı girin" : "Please enter a community name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCommunity.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        language_code: languageCode,
      });
      
      toast({
        title: language === "tr" ? "Topluluk oluşturuldu!" : "Community created!",
        description: language === "tr" ? `r/${name} artık yayında` : `r/${name} is now live`,
      });
      
      setName("");
      setDescription("");
      setIcon("💬");
      setLanguageCode("tr");
      onClose();
    } catch (error: any) {
      toast({
        title: language === "tr" ? "Hata" : "Error",
        description: error.message || (language === "tr" ? "Topluluk oluşturulamadı" : "Could not create community"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createCommunity")}</DialogTitle>
          <DialogDescription>
            {language === "tr" 
              ? "İlgi alanların etrafında bir topluluk oluştur. Topluluklar, insanların içerik paylaştığı ve konuları tartıştığı yerlerdir."
              : "Create a community around your interests. Communities are where people share content and discuss topics."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="icon">{t("communityIcon")}</Label>
            <div className="flex items-center gap-3">
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-14 text-2xl"
                  >
                    {icon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 text-xl p-0"
                        onClick={() => {
                          setIcon(emoji);
                          setEmojiPickerOpen(false);
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="text-sm text-muted-foreground">
                {language === "tr" ? "Topluluğun için bir simge seçmek için tıkla" : "Click to choose an icon for your community"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t("communityName")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                r/
              </span>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                placeholder={t("communityNamePlaceholder")}
                className="pl-8 bg-secondary border-none"
                maxLength={21}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "tr" ? "3-21 karakter. Sadece harf, rakam ve alt çizgi." : "3-21 characters. Letters, numbers and underscores only."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("communityDescription")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("communityDescriptionPlaceholder")}
              className="bg-secondary border-none resize-none min-h-24"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <Label>{language === "tr" ? "Dil" : "Language"}</Label>
            <Select value={languageCode} onValueChange={(val) => setLanguageCode(val as Language)}>
              <SelectTrigger className="bg-secondary border-none">
                <SelectValue placeholder={language === "tr" ? "Dil seçin" : "Select language"} />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {languageNames[lang].native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createCommunity.isPending || name.length < 3}
              className="flex-1 gap-2"
            >
              {createCommunity.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t("createCommunity")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityModal;
