import { useState, useRef } from "react";
import { Upload, Heart, Loader2, Download, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const MatchFinder = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "login",
  });
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [matchImage, setMatchImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gender, setGender] = useState<"girlfriend" | "boyfriend">("girlfriend");
  const [style, setStyle] = useState<"realistic" | "anime" | "artistic">("realistic");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: language === "tr" ? "Dosya çok büyük" : "File too large",
        description: language === "tr" ? "Maksimum 10MB" : "Maximum 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setMatchImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFindMatch = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("find-match", {
        body: { 
          imageBase64: uploadedImage,
          gender,
          style
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setMatchImage(data.matchImageUrl);
      toast({
        title: language === "tr" ? "Eşleşme bulundu!" : "Match found!",
        description: language === "tr" ? "İdeal eşiniz oluşturuldu" : "Your ideal match has been generated",
      });
    } catch (error) {
      console.error("Match finding error:", error);
      toast({
        title: language === "tr" ? "Hata" : "Error",
        description: error instanceof Error ? error.message : (language === "tr" ? "Bir hata oluştu" : "Something went wrong"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!matchImage) return;
    
    const link = document.createElement("a");
    link.href = matchImage;
    link.download = `ideal-match-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setMatchImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => setShowCreatePost(true)}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        />

        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">
                  {language === "tr" ? "İdeal Eş Bulucu" : "Ideal Match Finder"}
                </CardTitle>
                <CardDescription>
                  {language === "tr" 
                    ? "Fotoğrafınızı yükleyin ve AI ile ideal eşinizin görselini oluşturun"
                    : "Upload your photo and generate an image of your ideal match with AI"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      {language === "tr" ? "Eş Cinsiyet" : "Match Gender"}
                    </Label>
                    <RadioGroup value={gender} onValueChange={(v) => setGender(v as "girlfriend" | "boyfriend")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="girlfriend" id="girlfriend" />
                        <Label htmlFor="girlfriend" className="cursor-pointer">
                          {language === "tr" ? "Kız Arkadaş" : "Girlfriend"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="boyfriend" id="boyfriend" />
                        <Label htmlFor="boyfriend" className="cursor-pointer">
                          {language === "tr" ? "Erkek Arkadaş" : "Boyfriend"}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      {language === "tr" ? "Görsel Stili" : "Image Style"}
                    </Label>
                    <RadioGroup value={style} onValueChange={(v) => setStyle(v as "realistic" | "anime" | "artistic")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="realistic" id="realistic" />
                        <Label htmlFor="realistic" className="cursor-pointer">
                          {language === "tr" ? "Gerçekçi" : "Realistic"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anime" id="anime" />
                        <Label htmlFor="anime" className="cursor-pointer">
                          {language === "tr" ? "Anime" : "Anime"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="artistic" id="artistic" />
                        <Label htmlFor="artistic" className="cursor-pointer">
                          {language === "tr" ? "Artistik" : "Artistic"}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Upload Area */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {!uploadedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">
                      {language === "tr" ? "Fotoğrafınızı yükleyin" : "Upload your photo"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "tr" ? "PNG, JPG veya WebP (max 10MB)" : "PNG, JPG or WebP (max 10MB)"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Your Photo */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-center">
                        {language === "tr" ? "Sizin Fotoğrafınız" : "Your Photo"}
                      </h3>
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-border">
                        <img
                          src={uploadedImage}
                          alt="Your photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Match Result */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-center">
                        {language === "tr" ? "İdeal Eşiniz" : "Your Ideal Match"}
                      </h3>
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-border bg-secondary/50">
                        {matchImage ? (
                          <img
                            src={matchImage}
                            alt="Your ideal match"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-muted-foreground">
                              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                {language === "tr" 
                                  ? "Eşleşme burada görünecek" 
                                  : "Match will appear here"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {uploadedImage && !matchImage && (
                    <Button
                      onClick={handleFindMatch}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {language === "tr" ? "Eşleşme aranıyor..." : "Finding match..."}
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          {language === "tr" ? "Eşleşme Bul" : "Find Match"}
                        </>
                      )}
                    </Button>
                  )}

                  {matchImage && (
                    <>
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        {language === "tr" ? "İndir" : "Download"}
                      </Button>
                      <Button
                        onClick={handleFindMatch}
                        disabled={isProcessing}
                        variant="secondary"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {language === "tr" ? "Yeniden Oluştur" : "Regenerate"}
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {uploadedImage && (
                    <Button onClick={handleReset} variant="ghost">
                      {language === "tr" ? "Sıfırla" : "Reset"}
                    </Button>
                  )}
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-center text-muted-foreground">
                  {language === "tr" 
                    ? "Bu araç eğlence amaçlıdır. Oluşturulan görseller AI tarafından üretilmiştir ve gerçek kişileri temsil etmez."
                    : "This tool is for entertainment purposes only. Generated images are AI-created and do not represent real people."}
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        defaultMode={authModal.mode}
      />
    </div>
  );
};

export default MatchFinder;
