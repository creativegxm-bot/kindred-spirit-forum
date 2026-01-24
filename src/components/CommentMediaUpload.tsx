import { useState, useRef } from "react";
import { ImagePlus, Video, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadCommentMedia } from "@/hooks/useComments";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface CommentMediaUploadProps {
  onMediaUploaded: (url: string, type: "image" | "video") => void;
  imageUrl: string | null;
  videoUrl: string | null;
  onClearImage: () => void;
  onClearVideo: () => void;
  disabled?: boolean;
}

const CommentMediaUpload = ({
  onMediaUploaded,
  imageUrl,
  videoUrl,
  onClearImage,
  onClearVideo,
  disabled,
}: CommentMediaUploadProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const uploadMedia = useUploadCommentMedia();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File, type: "image" | "video") => {
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
    
    if (file.size > maxSize) {
      toast({
        title: language === "tr" ? "Dosya çok büyük" : "File too large",
        description: type === "image" 
          ? (language === "tr" ? "Maksimum görsel boyutu 5MB" : "Maximum image size is 5MB")
          : (language === "tr" ? "Maksimum video boyutu 50MB" : "Maximum video size is 50MB"),
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await uploadMedia.mutateAsync({ file, type });
      onMediaUploaded(result.url, result.type);
    } catch (error) {
      toast({
        title: language === "tr" ? "Yükleme hatası" : "Upload error",
        description: language === "tr" ? "Dosya yüklenemedi" : "Could not upload file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file, "image");
            e.target.value = "";
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file, "video");
            e.target.value = "";
          }}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || uploadMedia.isPending || !!imageUrl}
          className="gap-1.5 text-muted-foreground"
        >
          {uploadMedia.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {language === "tr" ? "Görsel" : "Image"}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          disabled={disabled || uploadMedia.isPending || !!videoUrl}
          className="gap-1.5 text-muted-foreground"
        >
          {uploadMedia.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Video className="h-4 w-4" />
          )}
          {language === "tr" ? "Video" : "Video"}
        </Button>
      </div>

      {/* Preview uploaded media */}
      {imageUrl && (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-h-32 rounded-md border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={onClearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {videoUrl && (
        <div className="relative inline-block">
          <video
            src={videoUrl}
            className="max-h-32 rounded-md border border-border"
            controls
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={onClearVideo}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentMediaUpload;