import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useVote } from "@/hooks/usePosts";
import { useCommentVote } from "@/hooks/useComments";
import { useToast } from "@/hooks/use-toast";

interface VoteButtonsProps {
  postId?: string;
  commentId?: string;
  upvotes: number;
  downvotes: number;
  userVote?: number | null;
  orientation?: "vertical" | "horizontal";
  onAuthRequired?: () => void;
}

const VoteButtons = ({
  postId,
  commentId,
  upvotes,
  downvotes,
  userVote: initialUserVote,
  orientation = "vertical",
  onAuthRequired,
}: VoteButtonsProps) => {
  const { user } = useAuth();
  const postVoteMutation = useVote();
  const commentVoteMutation = useCommentVote();
  const { toast } = useToast();

  const [optimisticVote, setOptimisticVote] = useState<number | null>(
    initialUserVote ?? null
  );
  const [optimisticScore, setOptimisticScore] = useState(upvotes - downvotes);

  const handleVote = async (voteType: 1 | -1) => {
    if (!user) {
      onAuthRequired?.();
      toast({
        title: "Login required",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }

    if (!postId && !commentId) return;

    const previousVote = optimisticVote;
    const previousScore = optimisticScore;

    let newVote: 1 | -1 | null;
    let scoreDelta: number;

    if (previousVote === voteType) {
      // Remove vote
      newVote = null;
      scoreDelta = -voteType;
    } else if (previousVote === null) {
      // Add new vote
      newVote = voteType;
      scoreDelta = voteType;
    } else {
      // Change vote
      newVote = voteType;
      scoreDelta = voteType * 2;
    }

    setOptimisticVote(newVote);
    setOptimisticScore(previousScore + scoreDelta);

    try {
      if (commentId && postId) {
        await commentVoteMutation.mutateAsync({
          comment_id: commentId,
          post_id: postId,
          vote_type: newVote,
        });
      } else if (postId) {
        await postVoteMutation.mutateAsync({
          post_id: postId,
          vote_type: newVote,
        });
      }
    } catch (error) {
      // Rollback on error
      setOptimisticVote(previousVote);
      setOptimisticScore(previousScore);
      toast({
        title: "Vote failed",
        description: "Could not register your vote",
        variant: "destructive",
      });
    }
  };

  const formatVotes = (votes: number) => {
    if (votes >= 1000000) {
      return (votes / 1000000).toFixed(1) + "M";
    }
    if (votes >= 1000) {
      return (votes / 1000).toFixed(1) + "k";
    }
    return votes.toString();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row"
      )}
    >
      <Button
        variant={optimisticVote === 1 ? "voteActive" : "vote"}
        size="vote"
        onClick={(e) => {
          e.stopPropagation();
          handleVote(1);
        }}
        className="vote-button"
      >
        <ArrowBigUp
          className={cn(
            "h-6 w-6 transition-colors",
            optimisticVote === 1 ? "fill-upvote text-upvote" : "hover:text-upvote"
          )}
        />
      </Button>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          optimisticVote === 1 && "text-upvote",
          optimisticVote === -1 && "text-downvote"
        )}
      >
        {formatVotes(optimisticScore)}
      </span>
      <Button
        variant={optimisticVote === -1 ? "voteActiveDown" : "vote"}
        size="vote"
        onClick={(e) => {
          e.stopPropagation();
          handleVote(-1);
        }}
        className="vote-button"
      >
        <ArrowBigDown
          className={cn(
            "h-6 w-6 transition-colors",
            optimisticVote === -1
              ? "fill-downvote text-downvote"
              : "hover:text-downvote"
          )}
        />
      </Button>
    </div>
  );
};

export default VoteButtons;
