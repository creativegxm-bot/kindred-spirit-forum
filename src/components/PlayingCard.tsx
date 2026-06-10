import { Card, isRed } from "@/lib/cards/deck";
import { cn } from "@/lib/utils";

interface Props {
  card?: Card | null;
  empty?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  selected?: boolean;
}

const sizes = {
  sm: "w-10 h-14 text-xs",
  md: "w-14 h-20 text-sm",
  lg: "w-16 h-24 text-base",
};

export const PlayingCard = ({
  card, empty, size = "md", onClick, className,
  draggable, onDragStart, onDragOver, onDrop, selected,
}: Props) => {
  if (empty || !card) {
    return (
      <div
        className={cn("pile-slot", sizes[size], className)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onClick}
      />
    );
  }

  if (!card.faceUp) {
    return (
      <div
        className={cn("playing-card back", sizes[size], "cursor-pointer", className)}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={cn(
        "playing-card relative flex flex-col justify-between p-1 font-bold cursor-pointer transition-transform",
        sizes[size],
        isRed(card.suit) && "red",
        selected && "ring-2 ring-amber-400 -translate-y-1",
        className,
      )}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="leading-none">
        <div>{card.rank}</div>
        <div className="text-[10px]">{card.suit}</div>
      </div>
      <div className="leading-none self-end rotate-180">
        <div>{card.rank}</div>
        <div className="text-[10px]">{card.suit}</div>
      </div>
    </div>
  );
};
