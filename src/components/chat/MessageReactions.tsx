import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToggleReaction, getReactionCounts, MessageReaction } from "@/hooks/useMessageReactions";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Smile } from "lucide-react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  isOwnMessage?: boolean;
}

const MessageReactions = ({ messageId, reactions, isOwnMessage }: MessageReactionsProps) => {
  const { user } = useAuth();
  const toggleReaction = useToggleReaction();
  const [pickerOpen, setPickerOpen] = useState(false);

  const reactionCounts = getReactionCounts(reactions, user?.id);

  const handleReaction = async (emoji: string, hasReacted: boolean) => {
    if (!user) return;
    
    try {
      await toggleReaction.mutateAsync({ messageId, emoji, hasReacted });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };

  const handleQuickReaction = (emoji: string) => {
    const existing = reactionCounts.find(r => r.emoji === emoji);
    handleReaction(emoji, existing?.userReacted || false);
    setPickerOpen(false);
  };

  return (
    <div className={cn(
      "flex items-center gap-1 flex-wrap mt-1",
      isOwnMessage ? "justify-end" : "justify-start"
    )}>
      {/* Existing reactions */}
      {reactionCounts.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => user && handleReaction(reaction.emoji, reaction.userReacted)}
          disabled={!user}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
            reaction.userReacted
              ? "bg-primary/20 border border-primary/40 text-foreground"
              : "bg-muted hover:bg-muted/80 border border-transparent text-foreground",
            !user && "cursor-default"
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      {user && (
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center justify-center h-6 w-6 rounded-full",
                "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                "transition-colors opacity-0 group-hover:opacity-100",
                reactionCounts.length > 0 && "opacity-100"
              )}
            >
              <Smile className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-2" 
            side={isOwnMessage ? "left" : "right"}
            align="start"
          >
            <div className="flex gap-1 flex-wrap max-w-[200px]">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleQuickReaction(emoji)}
                  className="text-lg hover:bg-muted p-1 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default MessageReactions;
