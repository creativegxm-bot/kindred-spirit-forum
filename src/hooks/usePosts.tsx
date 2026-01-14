import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Post {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  author_id: string;
  community_id: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    avatar_url: string | null;
  };
  community?: {
    name: string;
    icon: string | null;
  };
  user_vote?: number | null;
  is_saved?: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  banner_url: string | null;
  member_count: number;
  created_at: string;
}

export const usePosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["posts", user?.id],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select(`
          *,
          community:communities(name, icon)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author profiles separately
      const authorIds = [...new Set((posts || []).map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      let postsWithAuthors = (posts || []).map(post => ({
        ...post,
        author: profileMap.get(post.author_id) || { username: "deleted", avatar_url: null },
      }));

      if (user) {
        const { data: votes } = await supabase
          .from("votes")
          .select("post_id, vote_type")
          .eq("user_id", user.id)
          .not("post_id", "is", null);

        const { data: savedPosts } = await supabase
          .from("saved_posts")
          .select("post_id")
          .eq("user_id", user.id);

        const voteMap = new Map(votes?.map((v) => [v.post_id, v.vote_type]));
        const savedSet = new Set(savedPosts?.map((s) => s.post_id));

        postsWithAuthors = postsWithAuthors.map((post) => ({
          ...post,
          user_vote: voteMap.get(post.id) ?? null,
          is_saved: savedSet.has(post.id),
        }));
      }

      return postsWithAuthors as Post[];
    },
  });
};

export const useCommunities = () => {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("member_count", { ascending: false });

      if (error) throw error;
      return data as Community[];
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      title,
      content,
      community_id,
      image_url,
      link_url,
    }: {
      title: string;
      content?: string;
      community_id: string;
      image_url?: string;
      link_url?: string;
    }) => {
      if (!user) throw new Error("Must be logged in to create a post");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          title,
          content,
          community_id,
          image_url,
          link_url,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useVote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      post_id,
      vote_type,
    }: {
      post_id: string;
      vote_type: 1 | -1 | null;
    }) => {
      if (!user) throw new Error("Must be logged in to vote");

      if (vote_type === null) {
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", post_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("votes")
          .upsert(
            { user_id: user.id, post_id, vote_type },
            { onConflict: "user_id,post_id" }
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ post_id, save }: { post_id: string; save: boolean }) => {
      if (!user) throw new Error("Must be logged in to save posts");

      if (save) {
        const { error } = await supabase
          .from("saved_posts")
          .insert({ user_id: user.id, post_id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", post_id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
