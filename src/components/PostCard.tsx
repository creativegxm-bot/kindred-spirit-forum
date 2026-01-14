import { MessageSquare, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoteButtons from "./VoteButtons";
import { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const PostCard = ({ post, onClick }: PostCardProps) => {
  const timeAgo = formatDistanceToNow(post.createdAt, { addSuffix: true });

  return (
    <article
      className="group card-gradient rounded-lg border border-border transition-all duration-200 hover:border-primary/30 hover:card-hover-gradient cursor-pointer animate-slide-up"
      onClick={onClick}
    >
      <div className="flex">
        <div className="hidden sm:flex flex-col items-center gap-1 p-3 bg-secondary/30 rounded-l-lg">
          <VoteButtons upvotes={post.upvotes} downvotes={post.downvotes} />
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-lg">{post.communityIcon}</span>
            <span className="font-medium text-foreground hover:underline">
              r/{post.community}
            </span>
            <span>•</span>
            <span>Posted by u/{post.author}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>

          <h2 className="mt-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
            {post.content}
          </p>

          {post.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-md">
              <img
                src={post.imageUrl}
                alt=""
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          <div className="mt-3 flex items-center gap-1">
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
              className="gap-1.5 text-muted-foreground hover:text-comment"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
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
