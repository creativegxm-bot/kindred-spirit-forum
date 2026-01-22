import { useChatRooms } from "@/hooks/useChat";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { data: rooms, isLoading } = useChatRooms();
  const { t } = useLanguage();

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
          ) : rooms?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("noChatRooms")}</p>
            </div>
          ) : (
            rooms?.map((room) => (
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
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatRoomList;
