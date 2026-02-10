import { useState, useEffect } from "react";
import { X, Image, Link, List, FileText, Loader2, Video } from "lucide-react";
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
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import PostMediaUpload, { MediaItem } from "./PostMediaUpload";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

type PostType = "text" | "image" | "video" | "link" | "poll";

const CreatePostModal = ({ isOpen, onClose, onAuthRequired }: CreatePostModalProps) => {
  const [postType, setPostType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [linkUrl, setLinkUrl] = useState("");

  const { user } = useAuth();
  const { t, language } = useLanguage();
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
        title: "Missing information",
        description: "Please fill in the title and select a community",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use the first media item as image_url for backward compatibility
      const firstMedia = mediaItems.length > 0 ? mediaItems[0] : null;

      await createPostMutation.mutateAsync({
        title: title.trim(),
        content: content.trim() || undefined,
        community_id: communityId,
        country: "TR",
        image_url: firstMedia ? firstMedia.url : undefined,
        link_url: postType === "link" && linkUrl ? linkUrl : undefined,
        media_items: mediaItems.length > 0 ? mediaItems : undefined,
      });

      toast({
        title: "Post created!",
        description: "Your post has been published",
      });

      setTitle("");
      setContent("");
      setCommunityId("");
      setMediaItems([]);
      setLinkUrl("");
      onClose();
    } catch (error) {
      toast({
        title: "Failed to create post",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const postTypes: { type: PostType; icon: React.ReactNode; label: string }[] = [
    { type: "text", icon: <FileText className="h-4 w-4" />, label: t("post") },
    { type: "image", icon: <Image className="h-4 w-4" />, label: t("image") },
    { type: "video", icon: <Video className="h-4 w-4" />, label: "Video" },
    { type: "link", icon: <Link className="h-4 w-4" />, label: t("link") },
    { type: "poll", icon: <List className="h-4 w-4" />, label: t("poll") },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-2xl card-gradient rounded-lg border border-border animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{t("createPost")}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            <Select value={communityId} onValueChange={setCommunityId}>
              <SelectTrigger className="bg-secondary border-none">
                <SelectValue placeholder={t("selectCommunity")} />
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
              placeholder={t("postTitle")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-none text-lg font-medium focus-visible:ring-primary"
              maxLength={300}
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/300
            </div>

            {(postType === "text" || postType === "image" || postType === "video") && (
              <Textarea
                placeholder={t("postContentPlaceholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 bg-secondary border-none resize-none focus-visible:ring-primary"
              />
            )}

            {postType === "image" && (
              <PostMediaUpload
                type="image"
                mediaItems={mediaItems}
                onMediaItemsChange={setMediaItems}
              />
            )}

            {postType === "video" && (
              <PostMediaUpload
                type="video"
                mediaItems={mediaItems}
                onMediaItemsChange={setMediaItems}
              />
            )}

            {postType === "link" && (
              <Input
                placeholder={t("linkUrlPlaceholder")}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-secondary border-none focus-visible:ring-primary"
              />
            )}

            {postType === "poll" && (
              <div className="space-y-2">
                <Input placeholder="Option 1" className="bg-secondary border-none focus-visible:ring-primary" />
                <Input placeholder="Option 2" className="bg-secondary border-none focus-visible:ring-primary" />
                <Button variant="ghost" size="sm" className="text-primary">
                  + Add option
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              variant="create"
              disabled={!title.trim() || !communityId || createPostMutation.isPending}
              onClick={handleSubmit}
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                t("publish")
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
