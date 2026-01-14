import { X, MessageSquare, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoteButtons from "./VoteButtons";
import CommentItem from "./CommentItem";
import { Post } from "@/types";
import { comments } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";

interface PostDetailProps {
  post: Post;
  onClose: () => void;
}

const PostDetail = ({ post, onClose }: PostDetailProps) => {
  const timeAgo = formatDistanceToNow(post.createdAt, { addSuffix: true });

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex justify-center py-4 px-4">
        <div className="w-full max-w-3xl">
          <div className="card-gradient rounded-lg border border-border animate-scale-in">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur rounded-t-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{post.communityIcon}</span>
                <span className="font-medium">r/{post.community}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4">
              <div className="flex gap-4">
                <div className="hidden sm:block">
                  <VoteButtons upvotes={post.upvotes} downvotes={post.downvotes} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Posted by u/{post.author}</span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                  </div>

                  <h1 className="mt-2 text-xl font-bold">{post.title}</h1>

                  <p className="mt-3 text-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {post.imageUrl && (
                    <div className="mt-4 overflow-hidden rounded-md">
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-1">
                    <div className="sm:hidden">
                      <VoteButtons
                        upvotes={post.upvotes}
                        downvotes={post.downvotes}
                        orientation="horizontal"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.commentCount} Comments</span>
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
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <div className="mb-4">
                  <Textarea
                    placeholder="What are your thoughts?"
                    className="min-h-24 bg-secondary border-none resize-none focus-visible:ring-primary"
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm">Comment</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
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
