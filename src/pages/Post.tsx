import { useState } from "react";
import { useParams, useNavigate as useRouterNavigate } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { ArrowLeft, MessageSquare, Share, Bookmark, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoteButtons from "@/components/VoteButtons";
import CommentItem from "@/components/CommentItem";
import CommentMediaUpload from "@/components/CommentMediaUpload";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { usePosts } from "@/hooks/usePosts";
import { useComments, useCreateComment } from "@/hooks/useComments";
import { useRealtimeComments } from "@/hooks/useRealtimeSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";

const Post = () => {
  const { postId } = useParams<{ postId: string }>();
  const { navigate } = useLocalizedNavigate();
  const routerNavigate = useRouterNavigate();
  const [commentContent, setCommentContent] = useState("");
  const [commentImageUrl, setCommentImageUrl] = useState<string | null>(null);
  const [commentVideoUrl, setCommentVideoUrl] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const { data: comments = [], isLoading: commentsLoading } = useComments(postId || null);
  const createComment = useCreateComment();

  // Find the specific post
  const post = posts.find(p => p.id === postId);

  // Enable real-time updates for comments and votes
  useRealtimeComments(postId || null);

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthRequired = () => handleOpenAuth("login");

  const timeAgo = post ? formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: language === "tr" ? tr : enUS
  }) : "";

  const handleSubmitComment = async () => {
    if (!user) {
      handleAuthRequired();
      return;
    }

    if (!commentContent.trim() && !commentImageUrl && !commentVideoUrl) {
      toast({
        title: language === "tr" ? "Boş yorum" : "Empty comment",
        description: language === "tr" ? "Lütfen göndermeden önce bir şeyler yazın veya medya ekleyin" : "Please write something or add media before posting",
        variant: "destructive",
      });
      return;
    }

    if (!postId) return;

    try {
      await createComment.mutateAsync({
        post_id: postId,
        content: commentContent.trim(),
        image_url: commentImageUrl,
        video_url: commentVideoUrl,
      });
      setCommentContent("");
      setCommentImageUrl(null);
      setCommentVideoUrl(null);
      toast({
        title: language === "tr" ? "Yorum gönderildi" : "Comment posted",
        description: language === "tr" ? "Yorumun eklendi" : "Your comment has been added",
      });
    } catch (error) {
      toast({
        title: language === "tr" ? "Hata" : "Error",
        description: language === "tr" ? "Yorum gönderilemedi" : "Could not post comment",
        variant: "destructive",
      });
    }
  };

  const handleMediaUploaded = (url: string, type: "image" | "video") => {
    if (type === "image") {
      setCommentImageUrl(url);
    } else {
      setCommentVideoUrl(url);
    }
  };

  if (postsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onCreatePost={() => {}} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          onOpenAuth={handleOpenAuth} 
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onCreatePost={() => {}} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          onOpenAuth={handleOpenAuth} 
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">
              {language === "tr" ? "Gönderi bulunamadı" : "Post not found"}
            </h1>
            <Button onClick={() => navigate("/")}>
              {language === "tr" ? "Ana sayfaya dön" : "Go to home"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCreatePost={() => {}} 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        onOpenAuth={handleOpenAuth} 
      />
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            onOpenAuth={handleOpenAuth} 
          />

          {/* Main content */}
          <main className="flex-1 max-w-3xl">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => routerNavigate(-1)}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === "tr" ? "Geri" : "Back"}
            </Button>

            <div className="card-gradient rounded-lg border border-border">
              {/* Post header */}
              <div className="flex items-center gap-2 p-4 border-b border-border">
                <span className="text-lg">{post.community?.icon || "💬"}</span>
                <span 
                  className="font-medium hover:underline cursor-pointer"
                  onClick={() => navigate(`/r/${post.community?.name}`)}
                >
                  r/{post.community?.name || (language === "tr" ? "bilinmiyor" : "unknown")}
                </span>
              </div>

              <div className="p-4">
                <div className="flex gap-4">
                  {/* Vote buttons - desktop */}
                  <div className="hidden sm:block">
                    <VoteButtons
                      postId={post.id}
                      upvotes={post.upvotes}
                      downvotes={post.downvotes}
                      userVote={post.user_vote}
                      onAuthRequired={handleAuthRequired}
                    />
                  </div>

                  <div className="flex-1">
                    {/* Author info */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span 
                        className="hover:underline cursor-pointer"
                        onClick={() => navigate(`/u/${post.author?.username}`)}
                      >
                        u/{post.author?.username || (language === "tr" ? "silindi" : "deleted")}
                      </span>
                      <span>•</span>
                      <span>{timeAgo}</span>
                    </div>

                    {/* Title */}
                    <h1 className="mt-2 text-xl font-bold">{post.title}</h1>

                    {/* Content */}
                    {post.content && (
                      <p className="mt-3 text-foreground whitespace-pre-wrap">
                        {post.content}
                      </p>
                    )}

                    {/* Media */}
                    {post.image_url && (
                      <div className="mt-4 overflow-hidden rounded-md">
                        {/\.(mp4|webm|mov|avi|mkv)$/i.test(post.image_url) ? (
                          <video
                            src={post.image_url}
                            controls
                            className="w-full h-auto"
                          />
                        ) : (
                          <img
                            src={post.image_url}
                            alt=""
                            className="w-full h-auto"
                          />
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 flex items-center gap-1">
                      {/* Vote buttons - mobile */}
                      <div className="sm:hidden">
                        <VoteButtons
                          postId={post.id}
                          upvotes={post.upvotes}
                          downvotes={post.downvotes}
                          userVote={post.user_vote}
                          orientation="horizontal"
                          onAuthRequired={handleAuthRequired}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comment_count} {t("comments")}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                      >
                        <Share className="h-4 w-4" />
                        {t("share")}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                      >
                        <Bookmark className="h-4 w-4" />
                        {t("save")}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-muted-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-6 border-t border-border pt-6">
                      {/* Comment form */}
                      <div className="mb-6">
                        <Textarea
                          placeholder={user ? t("addComment") : t("loginToComment")}
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          className="min-h-24 bg-secondary border-none resize-none focus-visible:ring-primary"
                          disabled={!user}
                          onClick={() => !user && handleAuthRequired()}
                        />
                        {user && (
                          <div className="mt-2">
                            <CommentMediaUpload
                              onMediaUploaded={handleMediaUploaded}
                              imageUrl={commentImageUrl}
                              videoUrl={commentVideoUrl}
                              onClearImage={() => setCommentImageUrl(null)}
                              onClearVideo={() => setCommentVideoUrl(null)}
                            />
                          </div>
                        )}
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            onClick={handleSubmitComment}
                            disabled={createComment.isPending || (!commentContent.trim() && !commentImageUrl && !commentVideoUrl)}
                          >
                            {createComment.isPending
                              ? (language === "tr" ? "Gönderiliyor..." : "Posting...")
                              : t("postComment")}
                          </Button>
                        </div>
                      </div>

                      {/* Comments list */}
                      {commentsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">{language === "tr" ? "Henüz yorum yok" : "No comments yet"}</p>
                          <p className="text-sm">{language === "tr" ? "Düşüncelerini paylaşan ilk kişi ol!" : "Be the first to share your thoughts!"}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <CommentItem
                              key={comment.id}
                              comment={comment}
                              postId={post.id}
                              onAuthRequired={handleAuthRequired}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode={authMode}
      />
    </div>
  );
};

export default Post;
