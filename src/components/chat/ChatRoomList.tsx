import { useChatRooms } from "@/hooks/useChat";
import { useDirectMessages } from "@/hooks/useDirectMessage";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ChatRoomListProps {
  selectedRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}

const ChatRoomList = ({
  selectedRoomId,
  onSelectRoom,
  onCreateRoom,
}: ChatRoomListProps) => {
  const { user } = useAuth();
  const { data: rooms, isLoading: roomsLoading } = useChatRooms();
  const { data: dmRooms, isLoading: dmsLoading } = useDirectMessages();
  const { t } = useLanguage();

  const isLoading = roomsLoading || dmsLoading;
  const hasDMs = user && dmRooms && dmRooms.length > 0;
  const hasRooms = rooms && rooms.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t("chatRooms")}
          </h2>
          <Button size="sm" onClick={onCreateRoom} className="gap-1">
            <Plus className="h-4 w-4" />
            {t("create")}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : !hasRooms && !hasDMs ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("noChatRooms")}</p>
            </div>
          ) : (
            <>
              {/* Direct Messages Section */}
              {hasDMs && (
                <>
                  <div className="px-2 py-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("directMessages")}
                    </p>
                  </div>
                  {dmRooms.map((dm) => (
                    <button
                      key={dm.id}
                      onClick={() => onSelectRoom(dm.id)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors",
                        "hover:bg-accent",
                        selectedRoomId === dm.id
                          ? "bg-accent"
                          : "bg-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={dm.other_user?.avatar_url || undefined} />
                          <AvatarFallback>
                            {dm.other_user?.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {dm.other_user?.display_name || dm.other_user?.username || t("deletedUser")}
                          </p>
                          {dm.last_message && (
                            <p className="text-sm text-muted-foreground truncate">
                              {dm.last_message.content}
                            </p>
                          )}
                        </div>
                        {dm.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(dm.last_message.created_at), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Chat Rooms Section */}
              {hasRooms && (
                <>
                  <div className="px-2 py-1 mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("publicRooms")}
                    </p>
                  </div>
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => onSelectRoom(room.id)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors",
                        "hover:bg-accent",
                        selectedRoomId === room.id
                          ? "bg-accent"
                          : "bg-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{room.icon || "💬"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {room.name}
                          </p>
                          {room.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {room.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatRoomList;
