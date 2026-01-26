import { useState, useRef, useEffect, useMemo } from "react";
import {
  useChatRoom,
  useChatMessages,
  useSendMessage,
  useChatRoomMembers,
  useIsRoomMember,
  useJoinChatRoom,
  useLeaveChatRoom,
} from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useRoomReactions } from "@/hooks/useMessageReactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Users, LogIn, LogOut, User, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import InviteUsersModal from "./InviteUsersModal";
import MessageReactions from "./MessageReactions";

interface ChatRoomViewProps {
  roomId: string;
  onOpenAuth: (mode: "login" | "signup") => void;
}

const ChatRoomView = ({ roomId, onOpenAuth }: ChatRoomViewProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [otherUser, setOtherUser] = useState<{
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  
  const { data: room } = useChatRoom(roomId);
  const { data: messages, isLoading: messagesLoading } = useChatMessages(roomId);
  const { data: members } = useChatRoomMembers(roomId);
  const { data: isMember } = useIsRoomMember(roomId);
  const sendMessage = useSendMessage();
  const joinRoom = useJoinChatRoom();
  const leaveRoom = useLeaveChatRoom();

  // Get all message IDs for fetching reactions
  const messageIds = useMemo(() => messages?.map(m => m.id) || [], [messages]);
  const { data: reactionsByMessage } = useRoomReactions(roomId, messageIds);

  // Fetch other user info for DM rooms
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!room?.is_dm || !user || !members) return;
      
      const otherMember = members.find(m => m.user_id !== user.id);
      if (otherMember?.profile) {
        setOtherUser(otherMember.profile);
      }
    };
    fetchOtherUser();
  }, [room, user, members]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    try {
      await sendMessage.mutateAsync({ roomId, content: message.trim() });
      setMessage("");
    } catch (error) {
      toast.error(t("messageSendError"));
    }
  };

  const handleJoin = async () => {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    try {
      await joinRoom.mutateAsync(roomId);
      toast.success(t("joinedRoom"));
    } catch (error) {
      toast.error(t("joinRoomError"));
    }
  };

  const handleLeave = async () => {
    try {
      await leaveRoom.mutateAsync(roomId);
      toast.success(t("leftRoom"));
    } catch (error) {
      toast.error(t("leaveRoomError"));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          {t("loading")}...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Room Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          {room.is_dm && otherUser ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar_url || undefined} />
              <AvatarFallback>
                {otherUser.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="text-2xl">{room.icon || "💬"}</span>
          )}
          <div>
            <h2 className="font-semibold text-foreground">
              {room.is_dm && otherUser
                ? otherUser.display_name || otherUser.username
                : room.name}
            </h2>
            {!room.is_dm && room.description && (
              <p className="text-sm text-muted-foreground">{room.description}</p>
            )}
            {room.is_dm && otherUser && (
              <p className="text-sm text-muted-foreground">@{otherUser.username}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!room.is_dm && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{members?.length || 0}</span>
            </div>
          )}
          {/* Invite button for private room creators */}
          {user && room.is_private && room.created_by === user.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {t("inviteUsers")}
            </Button>
          )}
          {user && !room.is_dm && (
            isMember ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeave}
                disabled={leaveRoom.isPending}
              >
                <LogOut className="h-4 w-4 mr-1" />
                {t("leave")}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleJoin}
                disabled={joinRoom.isPending}
              >
                <LogIn className="h-4 w-4 mr-1" />
                {t("join")}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messagesLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("noMessages")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={`group flex gap-3 ${
                  msg.user_id === user?.id ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={msg.profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {msg.profile?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[70%] ${
                    msg.user_id === user?.id ? "text-right" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {msg.profile?.display_name || msg.profile?.username || t("deletedUser")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.user_id === user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <MessageReactions
                    messageId={msg.id}
                    reactions={reactionsByMessage?.[msg.id] || []}
                    isOwnMessage={msg.user_id === user?.id}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        {!user ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-2">{t("loginToChat")}</p>
            <Button onClick={() => onOpenAuth("login")}>{t("login")}</Button>
          </div>
        ) : !isMember ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-2">{t("joinToChat")}</p>
            <Button onClick={handleJoin} disabled={joinRoom.isPending}>
              {t("join")}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("typeMessage")}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Invite Users Modal */}
      {room.is_private && (
        <InviteUsersModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
          roomId={roomId}
          roomName={room.name}
        />
      )}
    </div>
  );
};

export default ChatRoomView;
