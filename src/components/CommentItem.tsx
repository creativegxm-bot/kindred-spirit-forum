import { useState } from "react";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoteButtons from "./VoteButtons";
import { Comment } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

const CommentItem = ({ comment, depth = 0 }: CommentItemProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const timeAgo = formatDistanceToNow(comment.createdAt, { addSuffix: true });

  if (depth > 4) return null;

  return (
    <div className="animate-slide-up">
      <div className="flex gap-2">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xs font-medium">
              {comment.author[0].toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (comment.replies?.length ?? 0) > 0 && (
            <div
              className="w-0.5 flex-1 bg-border hover:bg-primary/50 cursor-pointer mt-2"
              onClick={() => setIsCollapsed(true)}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-foreground">u/{comment.author}</span>
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
              <p className="mt-1 text-sm text-foreground">{comment.content}</p>

              <div className="flex items-center gap-1 mt-2">
                <VoteButtons
                  upvotes={comment.upvotes}
                  downvotes={comment.downvotes}
                  orientation="horizontal"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
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

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
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
