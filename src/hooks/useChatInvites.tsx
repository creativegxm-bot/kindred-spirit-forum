import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export interface ChatRoomInvite {
  id: string;
  room_id: string;
  invited_user_id: string;
  invited_by: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  responded_at: string | null;
  room?: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
  };
  inviter?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  invited_user?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

// Get pending invites for the current user
export const usePendingInvites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up realtime subscription for new invites
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`chat-invites-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_room_invites",
          filter: `invited_user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["pending-invites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("chat_room_invites")
        .select("*")
        .eq("invited_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch room info and inviter profiles
      const roomIds = [...new Set(data.map((i) => i.room_id))];
      const inviterIds = [...new Set(data.map((i) => i.invited_by))];

      const [{ data: rooms }, { data: profiles }] = await Promise.all([
        supabase.from("chat_rooms").select("id, name, icon, description").in("id", roomIds),
        supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", inviterIds),
      ]);

      const roomMap = new Map(rooms?.map((r) => [r.id, r]));
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      return data.map((invite) => ({
        ...invite,
        room: roomMap.get(invite.room_id),
        inviter: profileMap.get(invite.invited_by),
      })) as ChatRoomInvite[];
    },
    enabled: !!user,
  });
};

// Get invites for a specific room (for room creators)
export const useRoomInvites = (roomId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["room-invites", roomId],
    queryFn: async () => {
      if (!roomId) return [];

      const { data, error } = await supabase
        .from("chat_room_invites")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch invited user profiles
      const userIds = [...new Set(data.map((i) => i.invited_user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      return data.map((invite) => ({
        ...invite,
        invited_user: profileMap.get(invite.invited_user_id),
      })) as ChatRoomInvite[];
    },
    enabled: !!roomId && !!user,
  });
};

// Search users to invite
export const useSearchUsers = (query: string, excludeUserIds: string[] = []) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["search-users", query, excludeUserIds],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .not("user_id", "in", `(${[user?.id, ...excludeUserIds].join(",")})`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!query && query.length >= 2 && !!user,
  });
};

// Send an invite
export const useSendInvite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ roomId, userId }: { roomId: string; userId: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("chat_room_invites")
        .insert({
          room_id: roomId,
          invited_user_id: userId,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room-invites", roomId] });
    },
  });
};

// Accept an invite
export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      if (!user) throw new Error("Must be logged in");

      // Update invite status
      const { data: invite, error: updateError } = await supabase
        .from("chat_room_invites")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", inviteId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Join the room
      const { error: joinError } = await supabase.from("chat_room_members").insert({
        room_id: invite.room_id,
        user_id: user.id,
      });

      if (joinError) throw joinError;

      return invite;
    },
    onSuccess: (invite) => {
      queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
      queryClient.invalidateQueries({ queryKey: ["room-invites", invite.room_id] });
      queryClient.invalidateQueries({ queryKey: ["chat-room-members", invite.room_id] });
      queryClient.invalidateQueries({ queryKey: ["chat-room-membership", invite.room_id] });
    },
  });
};

// Decline an invite
export const useDeclineInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data, error } = await supabase
        .from("chat_room_invites")
        .update({ status: "declined", responded_at: new Date().toISOString() })
        .eq("id", inviteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (invite) => {
      queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
      queryClient.invalidateQueries({ queryKey: ["room-invites", invite.room_id] });
    },
  });
};

// Revoke an invite
export const useRevokeInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteId, roomId }: { inviteId: string; roomId: string }) => {
      const { error } = await supabase.from("chat_room_invites").delete().eq("id", inviteId);

      if (error) throw error;
      return { roomId };
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room-invites", roomId] });
    },
  });
};
