import { useState, useRef } from "react";
import { ImagePlus, Video, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUploadPostMedia } from "@/hooks/usePosts";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface PostMediaUploadProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  videoUrl?: string;
  onVideoUrlChange?: (url: string) => void;
  type: "image" | "video";
}

const PostMediaUpload = ({
  imageUrl,
  onImageUrlChange,
  videoUrl,
  onVideoUrlChange,
  type,
}: PostMediaUploadProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const uploadMedia = useUploadPostMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTab, setUploadTab] = useState<"upload" | "url">("upload");

  const handleFileSelect = async (file: File) => {
    const isImage = type === "image";
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({
        title: language === "tr" ? "Dosya çok büyük" : "File too large",
        description: isImage
          ? (language === "tr" ? "Maksimum görsel boyutu 10MB" : "Maximum image size is 10MB")
          : (language === "tr" ? "Maksimum video boyutu 100MB" : "Maximum video size is 100MB"),
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await uploadMedia.mutateAsync({ file, type });
      if (type === "image") {
        onImageUrlChange(result.url);
      } else if (onVideoUrlChange) {
        onVideoUrlChange(result.url);
      }
    } catch (error) {
      toast({
        title: language === "tr" ? "Yükleme hatası" : "Upload error",
        description: language === "tr" ? "Dosya yüklenemedi" : "Could not upload file",
        variant: "destructive",
      });
    }
  };

  const currentUrl = type === "image" ? imageUrl : (videoUrl || "");
  const handleUrlChange = type === "image" ? onImageUrlChange : (onVideoUrlChange || (() => {}));

  const handleClear = () => {
    handleUrlChange("");
  };

  return (
    <div className="space-y-3">
      <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as "upload" | "url")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            {language === "tr" ? "Dosya Yükle" : "Upload File"}
          </TabsTrigger>
          <TabsTrigger value="url">
            {language === "tr" ? "URL Gir" : "Enter URL"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={type === "image" ? "image/*" : "video/*"}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = "";
            }}
          />

          {!currentUrl ? (
            <Button
              type="button"
              variant="outline"
              className="w-full h-24 border-dashed gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMedia.isPending}
            >
              {uploadMedia.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {language === "tr" ? "Yükleniyor..." : "Uploading..."}
                </>
              ) : (
                <>
                  {type === "image" ? <ImagePlus className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  {type === "image"
                    ? (language === "tr" ? "Görsel yüklemek için tıklayın" : "Click to upload image")
                    : (language === "tr" ? "Video yüklemek için tıklayın" : "Click to upload video")}
                </>
              )}
            </Button>
          ) : null}
        </TabsContent>

        <TabsContent value="url" className="mt-3">
          <Input
            placeholder={
              type === "image"
                ? (language === "tr" ? "Görsel URL'si girin" : "Enter image URL")
                : (language === "tr" ? "Video URL'si girin" : "Enter video URL")
            }
            value={currentUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="bg-secondary border-none focus-visible:ring-primary"
          />
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {currentUrl && (
        <div className="relative">
          {type === "image" ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <img
                src={currentUrl}
                alt={language === "tr" ? "Önizleme" : "Preview"}
                className="w-full h-auto max-h-64 object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <video
                src={currentUrl}
                controls
                className="w-full h-auto max-h-64"
              />
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostMediaUpload;
