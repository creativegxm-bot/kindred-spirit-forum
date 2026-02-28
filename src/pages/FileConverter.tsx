import { useState, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import CreatePostModal from "@/components/CreatePostModal";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileImage, FileText, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FileType = "image" | "document" | "unknown";

interface ConvertedFile {
  name: string;
  url: string;
  type: string;
}

const imageFormats = ["png", "jpg", "jpeg", "webp", "gif", "bmp"];
const documentFormats = ["pdf", "docx", "doc", "txt"];

const FileConverter = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const getFileType = (file: File): FileType => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (imageFormats.includes(ext) || file.type.startsWith("image/")) {
      return "image";
    }
    if (documentFormats.includes(ext) || file.type.includes("pdf") || file.type.includes("document")) {
      return "document";
    }
    return "unknown";
  };

  const getAvailableFormats = (fileType: FileType): string[] => {
    switch (fileType) {
      case "image":
        return imageFormats;
      case "document":
        return ["pdf", "txt"];
      default:
        return [];
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: t("fileTooLarge"),
          description: t("maxFileSize"),
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setConvertedFile(null);
      setOutputFormat("");
      setProgress(0);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const convertImage = async (file: File, format: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // For formats that don't support transparency, fill with white
          if (format === "jpg" || format === "jpeg" || format === "bmp") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0);
          
          let mimeType = `image/${format}`;
          if (format === "jpg") mimeType = "image/jpeg";
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Conversion failed"));
              }
            },
            mimeType,
            0.92
          );
        } else {
          reject(new Error("Canvas context not available"));
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToText = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        resolve(new Blob([text], { type: "text/plain" }));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      
      if (file.type === "application/pdf") {
        reject(new Error(language === "tr" ? "PDF dönüşümü sunucu tarafında işlem gerektirir" : "PDF conversion requires server-side processing"));
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleConvert = async () => {
    if (!selectedFile || !outputFormat) return;

    setIsConverting(true);
    setProgress(10);

    try {
      const fileType = getFileType(selectedFile);
      let blob: Blob;
      
      setProgress(30);

      if (fileType === "image") {
        blob = await convertImage(selectedFile, outputFormat);
      } else if (outputFormat === "txt") {
        blob = await convertToText(selectedFile);
      } else {
        throw new Error(language === "tr" ? "Bu dönüşüm türü desteklenmiyor" : "This conversion type is not supported");
      }

      setProgress(80);

      const originalName = selectedFile.name.split(".").slice(0, -1).join(".");
      const newFileName = `${originalName}.${outputFormat}`;
      const url = URL.createObjectURL(blob);

      setConvertedFile({
        name: newFileName,
        url,
        type: blob.type,
      });

      setProgress(100);

      toast({
        title: t("conversionComplete"),
        description: `${selectedFile.name} → ${newFileName}`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: t("conversionError"),
        description: error instanceof Error ? error.message : (language === "tr" ? "Dosya dönüştürülemedi" : "Failed to convert file"),
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (convertedFile) {
      const a = document.createElement("a");
      a.href = convertedFile.url;
      a.download = convertedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setConvertedFile(null);
    setOutputFormat("");
    setProgress(0);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileType = selectedFile ? getFileType(selectedFile) : null;
  const availableFormats = fileType ? getAvailableFormats(fileType) : [];
  const currentExt = selectedFile?.name.split(".").pop()?.toLowerCase();

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => setCreatePostModalOpen(true)}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={openAuth}
      />
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onOpenAuth={openAuth} 
        />
        <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-6 w-6 text-primary" />
                {t("fileConverter")}
              </CardTitle>
              <CardDescription>
                {t("fileConverterDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${selectedFile 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                {selectedFile ? (
                  <div className="space-y-3">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                    )}
                    <div className="flex items-center justify-center gap-2">
                      {fileType === "image" ? (
                        <FileImage className="h-8 w-8 text-primary" />
                      ) : (
                        <FileText className="h-8 w-8 text-primary" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {fileType === "image" ? (language === "tr" ? "Görsel" : "Image") : (language === "tr" ? "Döküman" : "Document")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground">
                      {t("dragDropFile")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, WebP, GIF, BMP, PDF, DOC, TXT ({language === "tr" ? "maks." : "max."} 20MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Conversion Options */}
              {selectedFile && availableFormats.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium uppercase text-muted-foreground">
                      {currentExt}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t("selectFormat")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFormats
                          .filter((f) => f !== currentExt)
                          .map((format) => (
                            <SelectItem key={format} value={format}>
                              {format.toUpperCase()}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleClear}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleConvert}
                      disabled={!outputFormat || isConverting}
                    >
                      {isConverting ? t("converting") : t("convert")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isConverting && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {t("converting")} %{progress}
                  </p>
                </div>
              )}

              {/* Download Result */}
              {convertedFile && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Download className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{convertedFile.name}</p>
                          <p className="text-sm text-muted-foreground">{t("conversionComplete")}</p>
                        </div>
                      </div>
                      <Button onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        {t("download")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Supported Formats Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    {t("imageFormats")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, JPEG, WebP, GIF, BMP
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t("documentFormats")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "tr" ? "Metin dosyaları için TXT dönüşümü" : "TXT conversion for text files"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onAuthRequired={() => openAuth("login")}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
      <Footer />
    </div>
  );
};

export default FileConverter;
