import { useState } from "react";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useCreateChatRoom } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CreateChatRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateChatRoomModal = ({
  open,
  onOpenChange,
}: CreateChatRoomModalProps) => {
  const { t } = useLanguage();
  const { navigate } = useLocalizedNavigate();
  const createRoom = useCreateChatRoom();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💬");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error(t("roomNameRequired"));
      return;
    }

    try {
      const room = await createRoom.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon || "💬",
        isPrivate,
      });
      
      toast.success(t("roomCreated"));
      onOpenChange(false);
      setName("");
      setDescription("");
      setIcon("💬");
      setIsPrivate(false);
      navigate(`/chat/${room.id}`);
    } catch (error) {
      // Surface useful debug info in console while keeping the UI message user-friendly.
      console.error("Create chat room failed:", error);
      toast.error(t("roomCreateError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createChatRoom")}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("roomName")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("roomNamePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("roomDescription")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("roomDescriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">{t("roomIcon")}</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="💬"
              className="w-20 text-center text-2xl"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="private">{t("privateRoom")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("privateRoomDesc")}
              </p>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={createRoom.isPending}>
              {t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatRoomModal;
