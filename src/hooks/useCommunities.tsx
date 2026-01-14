import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CreateCommunityInput {
  name: string;
  description?: string;
  icon?: string;
}

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, description, icon }: CreateCommunityInput) => {
      if (!user) throw new Error("Must be logged in to create a community");

      // Validate name format
      const nameRegex = /^[a-zA-Z0-9_]+$/;
      if (!nameRegex.test(name)) {
        throw new Error("Community name can only contain letters, numbers, and underscores");
      }

      if (name.length < 3 || name.length > 21) {
        throw new Error("Community name must be between 3 and 21 characters");
      }

      const { data, error } = await supabase
        .from("communities")
        .insert({
          name,
          description: description || null,
          icon: icon || "💬",
          created_by: user.id,
          member_count: 1,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("A community with this name already exists");
        }
        throw error;
      }

      // Auto-join the creator to the community
      await supabase.from("community_members").insert({
        community_id: data.id,
        user_id: user.id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ communityId, join }: { communityId: string; join: boolean }) => {
      if (!user) throw new Error("Must be logged in");

      if (join) {
        const { error } = await supabase
          .from("community_members")
          .insert({ community_id: communityId, user_id: user.id });
        if (error && error.code !== "23505") throw error;
      } else {
        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", user.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};
