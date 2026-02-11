import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";

export interface DMRoom {
  id: string;
  name: string;
  icon: string | null;
  is_dm: boolean;
  created_at: string;
  other_user: {
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  last_message?: {
    content: string;
    created_at: string;
  } | null;
}

export const useDirectMessages = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dm-rooms", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all DM rooms where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from("chat_room_members")
        .select("room_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;
      if (!memberData?.length) return [];

      const roomIds = memberData.map((m) => m.room_id);

      // Get the DM rooms
      const { data: rooms, error: roomsError } = await supabase
        .from("chat_rooms")
        .select("*")
        .in("id", roomIds)
        .eq("is_dm", true);

      if (roomsError) throw roomsError;
      if (!rooms?.length) return [];

      // For each DM room, get the other user's info
      const dmRooms: DMRoom[] = await Promise.all(
        rooms.map(async (room) => {
          // Get all members of this room
          const { data: members } = await supabase
            .from("chat_room_members")
            .select("user_id")
            .eq("room_id", room.id);

          // Find the other user
          const otherUserId = members?.find((m) => m.user_id !== user.id)?.user_id;

          let otherUser = null;
          if (otherUserId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("user_id, username, display_name, avatar_url")
              .eq("user_id", otherUserId)
              .single();
            otherUser = profile;
          }

          // Get last message
          const { data: lastMsg } = await supabase
            .from("chat_messages")
            .select("content, created_at")
            .eq("room_id", room.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...room,
            other_user: otherUser,
            last_message: lastMsg,
          } as DMRoom;
        })
      );

      // Sort by last message time
      return dmRooms.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.created_at;
        const bTime = b.last_message?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    },
    enabled: !!user,
  });
};

export const useStartDirectMessage = () => {
  const queryClient = useQueryClient();
  const { navigate } = useLocalizedNavigate();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data, error } = await supabase.rpc("find_or_create_dm_room", {
        other_user_id: otherUserId,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: (roomId) => {
      queryClient.invalidateQueries({ queryKey: ["dm-rooms"] });
      navigate(`/chat/${roomId}`);
    },
  });
};
