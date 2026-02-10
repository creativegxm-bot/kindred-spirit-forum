import { useState, useRef } from "react";
import { ImagePlus, Video, X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUploadPostMedia } from "@/hooks/usePosts";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

export interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface PostMediaUploadProps {
  mediaItems: MediaItem[];
  onMediaItemsChange: (items: MediaItem[]) => void;
  type: "image" | "video";
}

const PostMediaUpload = ({
  mediaItems,
  onMediaItemsChange,
  type,
}: PostMediaUploadProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const uploadMedia = useUploadPostMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTab, setUploadTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");

  const handleFileSelect = async (file: File) => {
    const isImage = type === "image";
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: isImage ? "Maximum image size is 10MB" : "Maximum video size is 100MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await uploadMedia.mutateAsync({ file, type });
      onMediaItemsChange([...mediaItems, { url: result.url, type }]);
    } catch (error) {
      toast({
        title: "Upload error",
        description: "Could not upload file",
        variant: "destructive",
      });
    }
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      onMediaItemsChange([...mediaItems, { url: urlInput.trim(), type }]);
      setUrlInput("");
    }
  };

  const handleRemove = (index: number) => {
    onMediaItemsChange(mediaItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as "upload" | "url")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Enter URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={type === "image" ? "image/*" : "video/*"}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                Array.from(files).forEach((file) => handleFileSelect(file));
              }
              e.target.value = "";
            }}
          />
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
                Uploading...
              </>
            ) : (
              <>
                {type === "image" ? <ImagePlus className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                {type === "image" ? "Click to upload images" : "Click to upload videos"}
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="url" className="mt-3">
          <div className="flex gap-2">
            <Input
              placeholder={type === "image" ? "Enter image URL" : "Enter video URL"}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="bg-secondary border-none focus-visible:ring-primary"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
            />
            <Button type="button" size="icon" onClick={handleAddUrl} disabled={!urlInput.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Previews */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaItems.map((item, index) => (
            <div key={index} className="relative border border-border rounded-lg overflow-hidden">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <video src={item.url} controls className="w-full h-32" />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => handleRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostMediaUpload;
