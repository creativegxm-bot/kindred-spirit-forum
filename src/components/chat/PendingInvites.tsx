import { useLanguage } from "@/hooks/useLanguage";
import { usePendingInvites, useAcceptInvite, useDeclineInvite } from "@/hooks/useChatInvites";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PendingInvites = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: invites, isLoading } = usePendingInvites();
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();

  const handleAccept = async (inviteId: string, roomId: string, roomName: string) => {
    try {
      await acceptInvite.mutateAsync(inviteId);
      toast.success(t("inviteAccepted").replace("{room}", roomName));
      navigate(`/chat/${roomId}`);
    } catch (error) {
      toast.error(t("inviteAcceptError"));
    }
  };

  const handleDecline = async (inviteId: string) => {
    try {
      await declineInvite.mutateAsync(inviteId);
      toast.success(t("inviteDeclined"));
    } catch (error) {
      toast.error(t("inviteDeclineError"));
    }
  };

  if (isLoading || !invites || invites.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
        <Mail className="h-4 w-4" />
        {t("roomInvites")} ({invites.length})
      </div>
      <div className="space-y-1 px-2">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="bg-accent/50 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{invite.room?.icon || "🔒"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {invite.room?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("invitedBy")} {invite.inviter?.display_name || invite.inviter?.username}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleAccept(invite.id, invite.room_id, invite.room?.name || "")}
                disabled={acceptInvite.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                {t("accept")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleDecline(invite.id)}
                disabled={declineInvite.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                {t("decline")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingInvites;
