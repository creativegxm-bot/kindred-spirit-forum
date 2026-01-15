import { MessageSquare, Share, Bookmark, MoreHorizontal, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoteButtons from "./VoteButtons";
import { Post } from "@/hooks/usePosts";
import { useSavePost } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  post: Post;
  onClick: () => void;
  onAuthRequired: () => void;
}

const PostCard = ({ post, onClick, onAuthRequired }: PostCardProps) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const savePostMutation = useSavePost();
  const { toast } = useToast();
  const navigate = useNavigate();
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { 
    addSuffix: true, 
    locale: language === "tr" ? tr : enUS 
  });

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onAuthRequired();
      toast({
        title: language === "tr" ? "Giriş gerekli" : "Login required",
        description: language === "tr" ? "Gönderi kaydetmek için lütfen giriş yapın" : "Please log in to save posts",
        variant: "destructive",
      });
      return;
    }

    try {
      await savePostMutation.mutateAsync({
        post_id: post.id,
        save: !post.is_saved,
      });
      toast({
        title: post.is_saved 
          ? (language === "tr" ? "Gönderi kaldırıldı" : "Post removed")
          : (language === "tr" ? "Gönderi kaydedildi" : "Post saved"),
        description: post.is_saved 
          ? (language === "tr" ? "Kaydedilenlerden kaldırıldı" : "Removed from saved")
          : (language === "tr" ? "Kaydedilenlere eklendi" : "Added to saved"),
      });
    } catch {
      toast({
        title: language === "tr" ? "Hata" : "Error",
        description: language === "tr" ? "Gönderi kaydedilemedi" : "Could not save post",
        variant: "destructive",
      });
    }
  };

  return (
    <article
      className="group card-gradient rounded-lg border border-border transition-all duration-200 hover:border-primary/30 hover:card-hover-gradient cursor-pointer animate-slide-up"
      onClick={onClick}
    >
      <div className="flex">
        <div className="hidden sm:flex flex-col items-center gap-1 p-3 bg-secondary/30 rounded-l-lg">
          <VoteButtons
            postId={post.id}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userVote={post.user_vote}
            onAuthRequired={onAuthRequired}
          />
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-lg">{post.community?.icon || "💬"}</span>
            <span className="font-medium text-foreground hover:underline">
              r/{post.community?.name || (language === "tr" ? "bilinmiyor" : "unknown")}
            </span>
            <span>•</span>
            <span
              className="hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (post.author?.username) {
                  navigate(`/u/${post.author.username}`);
                }
              }}
            >
              {language === "tr" ? "u/" : "u/"}{post.author?.username || (language === "tr" ? "silindi" : "deleted")} {language === "tr" ? "tarafından" : ""}
            </span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>

          <h2 className="mt-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          {post.content && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {post.content}
            </p>
          )}

          {post.image_url && (
            <div className="mt-3 overflow-hidden rounded-md">
              <img
                src={post.image_url}
                alt=""
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          <div className="mt-3 flex items-center gap-1">
            <div className="sm:hidden">
              <VoteButtons
                postId={post.id}
                upvotes={post.upvotes}
                downvotes={post.downvotes}
                userVote={post.user_vote}
                orientation="horizontal"
                onAuthRequired={onAuthRequired}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-comment"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comment_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">{t("share")}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 ${post.is_saved ? "text-primary" : "text-muted-foreground"}`}
              onClick={handleSave}
            >
              {post.is_saved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{post.is_saved ? t("saved") : t("save")}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
