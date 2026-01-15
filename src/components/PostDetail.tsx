import { useState } from "react";
import { X, MessageSquare, Share, Bookmark, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoteButtons from "./VoteButtons";
import CommentItem from "./CommentItem";
import { Post } from "@/hooks/usePosts";
import { useComments, useCreateComment } from "@/hooks/useComments";
import { useRealtimeComments } from "@/hooks/useRealtimeSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onAuthRequired: () => void;
}

const PostDetail = ({ post, onClose, onAuthRequired }: PostDetailProps) => {
  const [commentContent, setCommentContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: comments = [], isLoading: commentsLoading } = useComments(post.id);
  const createComment = useCreateComment();
  
  // Enable real-time updates for comments and votes
  useRealtimeComments(post.id);
  
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleSubmitComment = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!commentContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      await createComment.mutateAsync({
        post_id: post.id,
        content: commentContent.trim(),
      });
      setCommentContent("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  const totalComments = comments.reduce((acc, comment) => {
    const countReplies = (c: typeof comment): number => {
      return 1 + (c.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0);
    };
    return acc + countReplies(comment);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex justify-center py-4 px-4">
        <div className="w-full max-w-3xl">
          <div className="card-gradient rounded-lg border border-border animate-scale-in">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur rounded-t-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{post.community?.icon || "💬"}</span>
                <span className="font-medium">r/{post.community?.name || "unknown"}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4">
              <div className="flex gap-4">
                <div className="hidden sm:block">
                  <VoteButtons
                    postId={post.id}
                    upvotes={post.upvotes}
                    downvotes={post.downvotes}
                    userVote={post.user_vote}
                    onAuthRequired={onAuthRequired}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Posted by u/{post.author?.username || "deleted"}</span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                  </div>

                  <h1 className="mt-2 text-xl font-bold">{post.title}</h1>

                  {post.content && (
                    <p className="mt-3 text-foreground whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

                  {post.image_url && (
                    <div className="mt-4 overflow-hidden rounded-md">
                      <img
                        src={post.image_url}
                        alt=""
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-1">
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
                      className="gap-1.5 text-muted-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comment_count} Comments</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                    >
                      <Share className="h-4 w-4" />
                      Share
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                    >
                      <Bookmark className="h-4 w-4" />
                      Save
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
                    <div className="mb-6">
                      <Textarea
                        placeholder={user ? "What are your thoughts?" : "Log in to comment"}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="min-h-24 bg-secondary border-none resize-none focus-visible:ring-primary"
                        disabled={!user}
                        onClick={() => !user && onAuthRequired()}
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={handleSubmitComment}
                          disabled={createComment.isPending || !commentContent.trim()}
                        >
                          {createComment.isPending ? "Posting..." : "Comment"}
                        </Button>
                      </div>
                    </div>

                    {commentsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No comments yet</p>
                        <p className="text-sm">Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={post.id}
                            onAuthRequired={onAuthRequired}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
