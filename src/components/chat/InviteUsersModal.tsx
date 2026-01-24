import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSearchUsers, useSendInvite, useRoomInvites, useRevokeInvite } from "@/hooks/useChatInvites";
import { useChatRoomMembers } from "@/hooks/useChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, X, Loader2, Check, Clock } from "lucide-react";
import { toast } from "sonner";

interface InviteUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomName: string;
}

const InviteUsersModal = ({ open, onOpenChange, roomId, roomName }: InviteUsersModalProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: members } = useChatRoomMembers(roomId);
  const { data: existingInvites } = useRoomInvites(roomId);
  
  // Exclude current members and already invited users from search
  const memberIds = members?.map((m) => m.user_id) || [];
  const invitedIds = existingInvites?.filter((i) => i.status === "pending").map((i) => i.invited_user_id) || [];
  const excludeIds = [...memberIds, ...invitedIds];
  
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery, excludeIds);
  const sendInvite = useSendInvite();
  const revokeInvite = useRevokeInvite();

  const handleInvite = async (userId: string, username: string) => {
    try {
      await sendInvite.mutateAsync({ roomId, userId });
      toast.success(t("inviteSent").replace("{user}", username));
      setSearchQuery("");
    } catch (error) {
      toast.error(t("inviteError"));
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      await revokeInvite.mutateAsync({ inviteId, roomId });
      toast.success(t("inviteRevoked"));
    } catch (error) {
      toast.error(t("inviteRevokeError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("inviteToRoom").replace("{room}", roomName)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchUsersToInvite")}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="border rounded-lg">
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults?.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {t("noUsersFound")}
                </div>
              ) : (
                <ScrollArea className="max-h-48">
                  <div className="divide-y">
                    {searchResults?.map((user) => (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between p-3 hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              {user.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {user.display_name || user.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleInvite(user.user_id, user.username)}
                          disabled={sendInvite.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          {t("invite")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Pending Invites */}
          {existingInvites && existingInvites.filter((i) => i.status === "pending").length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("pendingInvites")}
              </h4>
              <div className="border rounded-lg divide-y">
                {existingInvites
                  .filter((i) => i.status === "pending")
                  .map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={invite.invited_user?.avatar_url || undefined} />
                          <AvatarFallback>
                            {invite.invited_user?.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {invite.invited_user?.display_name || invite.invited_user?.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{invite.invited_user?.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {t("pending")}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleRevoke(invite.id)}
                          disabled={revokeInvite.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Accepted/Declined History */}
          {existingInvites && existingInvites.filter((i) => i.status !== "pending").length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("inviteHistory")}
              </h4>
              <div className="border rounded-lg divide-y">
                {existingInvites
                  .filter((i) => i.status !== "pending")
                  .slice(0, 5)
                  .map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={invite.invited_user?.avatar_url || undefined} />
                          <AvatarFallback>
                            {invite.invited_user?.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {invite.invited_user?.display_name || invite.invited_user?.username}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={invite.status === "accepted" ? "default" : "secondary"}
                        className="gap-1"
                      >
                        {invite.status === "accepted" ? (
                          <>
                            <Check className="h-3 w-3" />
                            {t("accepted")}
                          </>
                        ) : (
                          t("declined")
                        )}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUsersModal;
