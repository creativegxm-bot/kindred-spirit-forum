import { useState } from "react";
import { Loader2, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateCommunity } from "@/hooks/useCommunities";
import { useToast } from "@/hooks/use-toast";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

const EMOJI_OPTIONS = [
  "💬", "🎮", "🎵", "🎬", "📚", "💻", "🎨", "⚽", "🏀", "🎾",
  "🚀", "🌍", "🍕", "☕", "🐱", "🐕", "🌸", "🔥", "💡", "⭐",
  "🎯", "🎪", "🏆", "💰", "🔬", "🎭", "📷", "✈️", "🎸", "🎲",
];

const CreateCommunityModal = ({
  isOpen,
  onClose,
  onAuthRequired,
}: CreateCommunityModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💬");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  
  const createCommunity = useCreateCommunity();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a community name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCommunity.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
      });
      
      toast({
        title: "Community created!",
        description: `r/${name} is now live`,
      });
      
      setName("");
      setDescription("");
      setIcon("💬");
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create community",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Community</DialogTitle>
          <DialogDescription>
            Build a community around your interests. Communities are where people
            gather to share content and discuss topics.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Community Icon</Label>
            <div className="flex items-center gap-3">
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-14 text-2xl"
                  >
                    {icon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 text-xl p-0"
                        onClick={() => {
                          setIcon(emoji);
                          setEmojiPickerOpen(false);
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="text-sm text-muted-foreground">
                Click to choose an icon for your community
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Community Name</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                r/
              </span>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                placeholder="community_name"
                className="pl-8 bg-secondary border-none"
                maxLength={21}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              3-21 characters. Letters, numbers, and underscores only.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your community about?"
              className="bg-secondary border-none resize-none min-h-24"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCommunity.isPending || name.length < 3}
              className="flex-1 gap-2"
            >
              {createCommunity.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create Community
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityModal;
