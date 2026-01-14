import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  orientation?: "vertical" | "horizontal";
}

const VoteButtons = ({ upvotes, downvotes, orientation = "vertical" }: VoteButtonsProps) => {
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null);
  const [currentVotes, setCurrentVotes] = useState(upvotes - downvotes);

  const handleUpvote = () => {
    if (voteState === "up") {
      setVoteState(null);
      setCurrentVotes(upvotes - downvotes);
    } else if (voteState === "down") {
      setVoteState("up");
      setCurrentVotes(upvotes - downvotes + 2);
    } else {
      setVoteState("up");
      setCurrentVotes(upvotes - downvotes + 1);
    }
  };

  const handleDownvote = () => {
    if (voteState === "down") {
      setVoteState(null);
      setCurrentVotes(upvotes - downvotes);
    } else if (voteState === "up") {
      setVoteState("down");
      setCurrentVotes(upvotes - downvotes - 2);
    } else {
      setVoteState("down");
      setCurrentVotes(upvotes - downvotes - 1);
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
        variant={voteState === "up" ? "voteActive" : "vote"}
        size="vote"
        onClick={handleUpvote}
        className="vote-button"
      >
        <ArrowBigUp
          className={cn(
            "h-6 w-6 transition-colors",
            voteState === "up" ? "fill-upvote text-upvote" : "hover:text-upvote"
          )}
        />
      </Button>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          voteState === "up" && "text-upvote",
          voteState === "down" && "text-downvote"
        )}
      >
        {formatVotes(currentVotes)}
      </span>
      <Button
        variant={voteState === "down" ? "voteActiveDown" : "vote"}
        size="vote"
        onClick={handleDownvote}
        className="vote-button"
      >
        <ArrowBigDown
          className={cn(
            "h-6 w-6 transition-colors",
            voteState === "down" ? "fill-downvote text-downvote" : "hover:text-downvote"
          )}
        />
      </Button>
    </div>
  );
};

export default VoteButtons;
