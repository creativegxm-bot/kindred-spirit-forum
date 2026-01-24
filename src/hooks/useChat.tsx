import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_private: boolean | null;
  is_dm: boolean | null;
  created_by: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    display_name: string | null;
  };
}

export interface ChatRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    display_name: string | null;
  };
}

export const useChatRooms = () => {
  return useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("is_private", false)
        .eq("is_dm", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ChatRoom[];
    },
  });
};

export const useChatRoom = (roomId: string | undefined) => {
  return useQuery({
    queryKey: ["chat-room", roomId],
    queryFn: async () => {
      if (!roomId) return null;
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) throw error;
      return data as ChatRoom;
    },
    enabled: !!roomId,
  });
};

export const useChatMessages = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat-messages-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the profile for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url, display_name")
            .eq("user_id", payload.new.user_id)
            .single();

          const newMessage = {
            ...payload.new,
            profile,
          } as ChatMessage;

          queryClient.setQueryData(
            ["chat-messages", roomId],
            (old: ChatMessage[] | undefined) => {
              if (!old) return [newMessage];
              // Avoid duplicates
              if (old.some((m) => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return useQuery({
    queryKey: ["chat-messages", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for all messages
      const userIds = [...new Set(data.map((m) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      return data.map((message) => ({
        ...message,
        profile: profileMap.get(message.user_id),
      })) as ChatMessage[];
    },
    enabled: !!roomId,
  });
};

export const useChatRoomMembers = (roomId: string | undefined) => {
  return useQuery({
    queryKey: ["chat-room-members", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("chat_room_members")
        .select("*")
        .eq("room_id", roomId);

      if (error) throw error;

      // Fetch profiles
      const userIds = data.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      return data.map((member) => ({
        ...member,
        profile: profileMap.get(member.user_id),
      })) as ChatRoomMember[];
    },
    enabled: !!roomId,
  });
};

export const useCreateChatRoom = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      icon,
      isPrivate,
    }: {
      name: string;
      description?: string;
      icon?: string;
      isPrivate?: boolean;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("chat_rooms")
        .insert({
          name,
          description: description || null,
          icon: icon || "💬",
          is_private: isPrivate || false,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator to the room
      const { error: memberError } = await supabase.from("chat_room_members").insert({
        room_id: data.id,
        user_id: user.id,
      });

      if (memberError) {
        console.error("Failed to auto-join room:", memberError);
        // Don't throw - room was still created successfully
      }

      return data as ChatRoom;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["chat-room-members", data.id] });
      queryClient.invalidateQueries({ queryKey: ["chat-room-membership", data.id] });
    },
  });
};

export const useSendMessage = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      roomId,
      content,
    }: {
      roomId: string;
      content: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: roomId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useJoinChatRoom = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("chat_room_members").insert({
        room_id: roomId,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-room-members", roomId] });
      // Important: ChatRoomView gates the input by this query; without invalidation,
      // a successful join can still appear as not-a-member.
      queryClient.invalidateQueries({ queryKey: ["chat-room-membership", roomId] });
    },
  });
};

export const useLeaveChatRoom = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("chat_room_members")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-room-members", roomId] });
      queryClient.invalidateQueries({ queryKey: ["chat-room-membership", roomId] });
    },
  });
};

export const useIsRoomMember = (roomId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat-room-membership", roomId, user?.id],
    queryFn: async () => {
      if (!roomId || !user) return false;

      const { data, error } = await supabase
        .from("chat_room_members")
        .select("id")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!roomId && !!user,
  });
};
