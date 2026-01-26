import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export const useMessageReactions = (messageId: string | undefined) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Subscribe to realtime updates for this message's reactions
  useEffect(() => {
    if (!messageId) return;

    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_message_reactions",
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          // Invalidate the query to refetch reactions
          queryClient.invalidateQueries({ queryKey: ["message-reactions", messageId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId, queryClient]);

  return useQuery({
    queryKey: ["message-reactions", messageId],
    queryFn: async () => {
      if (!messageId) return [];

      const { data, error } = await supabase
        .from("chat_message_reactions")
        .select("*")
        .eq("message_id", messageId);

      if (error) throw error;
      return data as MessageReaction[];
    },
    enabled: !!messageId,
  });
};

export const useRoomReactions = (roomId: string | undefined, messageIds: string[]) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Subscribe to realtime updates for all messages in this room
  useEffect(() => {
    if (!roomId || messageIds.length === 0) return;

    const channel = supabase
      .channel(`room-reactions-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_message_reactions",
        },
        (payload) => {
          const messageId = (payload.new as MessageReaction)?.message_id || 
                           (payload.old as MessageReaction)?.message_id;
          if (messageId && messageIds.includes(messageId)) {
            queryClient.invalidateQueries({ queryKey: ["room-reactions", roomId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, messageIds.join(","), queryClient]);

  return useQuery({
    queryKey: ["room-reactions", roomId, messageIds.join(",")],
    queryFn: async () => {
      if (!roomId || messageIds.length === 0) return {};

      const { data, error } = await supabase
        .from("chat_message_reactions")
        .select("*")
        .in("message_id", messageIds);

      if (error) throw error;

      // Group reactions by message_id
      const reactionsByMessage: Record<string, MessageReaction[]> = {};
      for (const reaction of data) {
        if (!reactionsByMessage[reaction.message_id]) {
          reactionsByMessage[reaction.message_id] = [];
        }
        reactionsByMessage[reaction.message_id].push(reaction);
      }

      return reactionsByMessage;
    },
    enabled: !!roomId && messageIds.length > 0,
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("chat_message_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        })
        .select()
        .single();

      if (error) {
        // If it's a duplicate, that's fine - user already reacted with this emoji
        if (error.code === "23505") {
          return null;
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["message-reactions", variables.messageId] });
      queryClient.invalidateQueries({ queryKey: ["room-reactions"] });
    },
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("chat_message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["message-reactions", variables.messageId] });
      queryClient.invalidateQueries({ queryKey: ["room-reactions"] });
    },
  });
};

export const useToggleReaction = () => {
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      emoji, 
      hasReacted 
    }: { 
      messageId: string; 
      emoji: string; 
      hasReacted: boolean;
    }) => {
      if (hasReacted) {
        await removeReaction.mutateAsync({ messageId, emoji });
      } else {
        await addReaction.mutateAsync({ messageId, emoji });
      }
    },
  });
};

// Helper to compute reaction counts from raw reactions
export const getReactionCounts = (
  reactions: MessageReaction[],
  userId: string | undefined
): ReactionCount[] => {
  const countMap = new Map<string, { count: number; userReacted: boolean }>();

  for (const reaction of reactions) {
    const existing = countMap.get(reaction.emoji);
    if (existing) {
      existing.count++;
      if (reaction.user_id === userId) {
        existing.userReacted = true;
      }
    } else {
      countMap.set(reaction.emoji, {
        count: 1,
        userReacted: reaction.user_id === userId,
      });
    }
  }

  return Array.from(countMap.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    userReacted: data.userReacted,
  }));
};
