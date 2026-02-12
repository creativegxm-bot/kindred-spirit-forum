import { useState, useRef } from "react";
import { Upload, Sparkles, Loader2, X, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

const PhotoEnhancerTool = () => {
  const [open, setOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [enhanceType, setEnhanceType] = useState("enhance");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const enhanceOptions = [
    { value: "enhance", label: t("enhanceGeneral"), desc: t("enhanceGeneralDesc") },
    { value: "restore", label: t("enhanceRestore"), desc: t("enhanceRestoreDesc") },
    { value: "colorize", label: t("enhanceColorize"), desc: t("enhanceColorizeDesc") },
    { value: "portrait", label: t("enhancePortrait"), desc: t("enhancePortraitDesc") },
    { value: "hdr", label: t("enhanceHdr"), desc: t("enhanceHdrDesc") },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: t("invalidFile"), description: t("pleaseUploadPhoto"), variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t("fileTooLargePhoto"), description: t("maxFileSizePhoto"), variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setEnhancedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processEnhancement = async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    setEnhancedImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("age-progression", {
        body: { imageBase64: uploadedImage, enhanceType },
      });
      if (error) throw new Error(error.message || t("processingFailed"));
      if (data?.error) throw new Error(data.error);
      if (!data?.enhancedImageUrl) throw new Error(t("enhanceError"));
      setEnhancedImage(data.enhancedImageUrl);
      toast({ title: t("success"), description: t("enhanceSuccess") });
    } catch (error) {
      console.error("Photo enhance error:", error);
      toast({ title: t("error"), description: error instanceof Error ? error.message : t("processingFailed"), variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = async () => {
    if (!enhancedImage) return;
    try {
      if (enhancedImage.startsWith("data:")) {
        const response = await fetch(enhancedImage);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `enhanced-${enhanceType}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const link = document.createElement("a");
        link.href = enhancedImage;
        link.download = `enhanced-${enhanceType}.png`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast({ title: t("downloaded"), description: t("downloadSuccess") });
    } catch {
      toast({ title: t("error"), description: t("downloadError"), variant: "destructive" });
    }
  };

  const resetTool = () => {
    setUploadedImage(null);
    setEnhancedImage(null);
    setEnhanceType("enhance");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/30 transition-all duration-300"
        >
          <Wand2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t("photoEnhancer")}</span>
          <span className="sm:hidden">{t("photoEnhancerShort")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {t("photoEnhancerTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">{t("uploadPhoto")}</p>
              <p className="text-sm text-muted-foreground">{t("uploadPhotoDesc")}</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("original")}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetTool}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={uploadedImage} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t("enhanced")}</span>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {isProcessing ? (
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
                        <p className="text-sm text-muted-foreground">{t("aiProcessing")}</p>
                      </div>
                    ) : enhancedImage ? (
                      <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Sparkles className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">{t("selectModeStart")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">{t("enhanceMode")}</span>
                <Select value={enhanceType} onValueChange={setEnhanceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {enhanceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={processEnhancement}
                  disabled={isProcessing}
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {isProcessing ? t("enhancing") : t("enhance")}
                </Button>
                {enhancedImage && (
                  <Button variant="outline" onClick={downloadImage} className="gap-2">
                    <Download className="h-4 w-4" />
                    {t("download")}
                  </Button>
                )}
              </div>
            </>
          )}
          <p className="text-xs text-muted-foreground text-center">{t("photoPrivacy")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoEnhancerTool;
