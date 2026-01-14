import { useState } from "react";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoteButtons from "./VoteButtons";
import { Comment, useCreateComment } from "@/hooks/useComments";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
  onAuthRequired: () => void;
}

const CommentItem = ({ comment, postId, depth = 0, onAuthRequired }: CommentItemProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const createComment = useCreateComment();
  
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });

  const handleReply = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Empty reply",
        description: "Please write something before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      await createComment.mutateAsync({
        post_id: postId,
        content: replyContent.trim(),
        parent_id: comment.id,
      });
      setReplyContent("");
      setIsReplying(false);
      toast({
        title: "Reply posted",
        description: "Your reply has been added",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    }
  };

  if (depth > 6) return null;

  return (
    <div className="animate-slide-up">
      <div className="flex gap-2">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">
              {comment.author?.username?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          {!isCollapsed && ((comment.replies?.length ?? 0) > 0 || isReplying) && (
            <div
              className="w-0.5 flex-1 bg-border hover:bg-primary/50 cursor-pointer mt-2"
              onClick={() => setIsCollapsed(true)}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-foreground">
              u/{comment.author?.username || "deleted"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{timeAgo}</span>
          </div>

          {isCollapsed ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground mt-1"
              onClick={() => setIsCollapsed(false)}
            >
              [+] Expand thread
            </Button>
          ) : (
            <>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </p>

              <div className="flex items-center gap-1 mt-2">
                <VoteButtons
                  commentId={comment.id}
                  postId={postId}
                  upvotes={comment.upvotes}
                  downvotes={comment.downvotes}
                  userVote={comment.user_vote}
                  orientation="horizontal"
                  onAuthRequired={onAuthRequired}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={() => {
                    if (!user) {
                      onAuthRequired();
                      return;
                    }
                    setIsReplying(!isReplying);
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {isReplying && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-20 bg-secondary border-none resize-none focus-visible:ring-primary text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={createComment.isPending || !replyContent.trim()}
                    >
                      {createComment.isPending ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      depth={depth + 1}
                      onAuthRequired={onAuthRequired}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
