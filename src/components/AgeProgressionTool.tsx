import { useState, useRef } from "react";
import { Upload, Sparkles, Loader2, X, Download, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AgeProgressionTool = () => {
  const [open, setOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [agedImage, setAgedImage] = useState<string | null>(null);
  const [targetAge, setTargetAge] = useState([50]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Geçersiz dosya",
        description: "Lütfen bir fotoğraf yükleyin",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: "Maksimum dosya boyutu 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setAgedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processAgeProgression = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setAgedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("age-progression", {
        body: {
          imageBase64: uploadedImage,
          targetAge: targetAge[0],
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAgedImage(data.agedImageUrl);
      toast({
        title: "Başarılı!",
        description: `${targetAge[0]} yaşındaki haliniz hazır`,
      });
    } catch (error) {
      console.error("Age progression error:", error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "İşlem başarısız oldu",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!agedImage) return;
    
    const link = document.createElement("a");
    link.href = agedImage;
    link.download = `age-${targetAge[0]}-progression.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setUploadedImage(null);
    setAgedImage(null);
    setTargetAge([50]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/30 transition-all duration-300"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Yaşlanma Simülasyonu</span>
          <span className="sm:hidden">Yaşlan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Yaşlanma Simülasyonu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Section */}
          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Fotoğrafınızı Yükleyin</p>
              <p className="text-sm text-muted-foreground">
                Yüzünüzün net göründüğü bir fotoğraf seçin
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Images Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Şimdiki Haliniz</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={resetTool}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={uploadedImage}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Aged Image */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">
                    {targetAge[0]} Yaşında
                  </span>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {isProcessing ? (
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
                        <p className="text-sm text-muted-foreground">
                          AI işliyor...
                        </p>
                      </div>
                    ) : agedImage ? (
                      <img
                        src={agedImage}
                        alt="Aged"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Sparkles className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Yaş seçip başlatın</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Age Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hedef Yaş</span>
                  <span className="text-2xl font-bold text-purple-500">
                    {targetAge[0]}
                  </span>
                </div>
                <Slider
                  value={targetAge}
                  onValueChange={setTargetAge}
                  min={30}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30</span>
                  <span>50</span>
                  <span>70</span>
                  <span>90</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={processAgeProgression}
                  disabled={isProcessing}
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isProcessing ? "İşleniyor..." : "Yaşlandır"}
                </Button>
                {agedImage && (
                  <Button
                    variant="outline"
                    onClick={downloadImage}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    İndir
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            🔒 Fotoğraflarınız güvenli şekilde işlenir ve saklanmaz
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeProgressionTool;
