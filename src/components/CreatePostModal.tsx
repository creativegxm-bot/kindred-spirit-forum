import { useState } from "react";
import { X, Image, Link, List, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunities, useCreatePost } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

type PostType = "text" | "image" | "link" | "poll";

const CreatePostModal = ({ isOpen, onClose, onAuthRequired }: CreatePostModalProps) => {
  const [postType, setPostType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const { user } = useAuth();
  const { data: communities = [] } = useCommunities();
  const createPostMutation = useCreatePost();
  const { toast } = useToast();

  if (!isOpen) return null;

  if (!user) {
    onAuthRequired();
    onClose();
    return null;
  }

  const handleSubmit = async () => {
    if (!title.trim() || !communityId) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen başlığı doldurun ve bir topluluk seçin",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        title: title.trim(),
        content: content.trim() || undefined,
        community_id: communityId,
        image_url: postType === "image" && imageUrl ? imageUrl : undefined,
        link_url: postType === "link" && linkUrl ? linkUrl : undefined,
      });

      toast({
        title: "Gönderi oluşturuldu!",
        description: "Gönderiniz yayınlandı",
      });

      setTitle("");
      setContent("");
      setCommunityId("");
      setImageUrl("");
      setLinkUrl("");
      onClose();
    } catch (error) {
      toast({
        title: "Gönderi oluşturulamadı",
        description: "Lütfen tekrar deneyin",
        variant: "destructive",
      });
    }
  };

  const postTypes: { type: PostType; icon: React.ReactNode; label: string }[] = [
    { type: "text", icon: <FileText className="h-4 w-4" />, label: "Gönderi" },
    { type: "image", icon: <Image className="h-4 w-4" />, label: "Görsel" },
    { type: "link", icon: <Link className="h-4 w-4" />, label: "Link" },
    { type: "poll", icon: <List className="h-4 w-4" />, label: "Anket" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-2xl card-gradient rounded-lg border border-border animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Gönderi oluştur</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            <Select value={communityId} onValueChange={setCommunityId}>
              <SelectTrigger className="w-full bg-secondary border-none">
                <SelectValue placeholder="Bir topluluk seç" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    <div className="flex items-center gap-2">
                      <span>{community.icon || "💬"}</span>
                      <span>r/{community.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-1 p-1 bg-secondary rounded-lg">
              {postTypes.map(({ type, icon, label }) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 gap-2",
                    postType === type && "bg-card text-primary"
                  )}
                  onClick={() => setPostType(type)}
                >
                  {icon}
                  {label}
                </Button>
              ))}
            </div>

            <Input
              placeholder="Başlık"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-none text-lg font-medium focus-visible:ring-primary"
              maxLength={300}
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/300
            </div>

            {postType === "text" && (
              <Textarea
                placeholder="Metin (isteğe bağlı)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 bg-secondary border-none resize-none focus-visible:ring-primary"
              />
            )}

            {postType === "image" && (
              <div className="space-y-3">
                <Input
                  placeholder="Görsel URL'si"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-secondary border-none focus-visible:ring-primary"
                />
                {imageUrl && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Önizleme"
                      className="w-full h-auto max-h-64 object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>
            )}

            {postType === "link" && (
              <Input
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-secondary border-none focus-visible:ring-primary"
              />
            )}

            {postType === "poll" && (
              <div className="space-y-2">
                <Input
                  placeholder="Seçenek 1"
                  className="bg-secondary border-none focus-visible:ring-primary"
                />
                <Input
                  placeholder="Seçenek 2"
                  className="bg-secondary border-none focus-visible:ring-primary"
                />
                <Button variant="ghost" size="sm" className="text-primary">
                  + Seçenek ekle
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button
              variant="create"
              disabled={!title.trim() || !communityId || createPostMutation.isPending}
              onClick={handleSubmit}
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                "Gönder"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
