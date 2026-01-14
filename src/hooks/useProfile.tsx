import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  karma: number;
  created_at: string;
  updated_at: string;
}

export interface UserPost {
  id: string;
  title: string;
  content: string | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  community?: {
    name: string;
    icon: string | null;
  };
}

export interface UserComment {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  post?: {
    id: string;
    title: string;
  };
}

export const useUserProfile = (username: string) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!username,
  });
};

export const useUserPosts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          content,
          upvotes,
          downvotes,
          comment_count,
          created_at,
          community:communities(name, icon)
        `)
        .eq("author_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserPost[];
    },
    enabled: !!userId,
  });
};

export const useUserComments = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-comments", userId],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          upvotes,
          downvotes,
          created_at,
          post_id
        `)
        .eq("author_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch associated posts
      const postIds = [...new Set(comments?.map(c => c.post_id) || [])];
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title")
        .in("id", postIds);

      const postMap = new Map(posts?.map(p => [p.id, p]) || []);

      return (comments || []).map(comment => ({
        ...comment,
        post: postMap.get(comment.post_id) || null,
      })) as UserComment[];
    },
    enabled: !!userId,
  });
};

export const useUserKarma = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-karma", userId],
    queryFn: async () => {
      // Get post karma
      const { data: posts } = await supabase
        .from("posts")
        .select("upvotes, downvotes")
        .eq("author_id", userId!);

      const postKarma = (posts || []).reduce(
        (acc, p) => acc + p.upvotes - p.downvotes,
        0
      );

      // Get comment karma
      const { data: comments } = await supabase
        .from("comments")
        .select("upvotes, downvotes")
        .eq("author_id", userId!);

      const commentKarma = (comments || []).reduce(
        (acc, c) => acc + c.upvotes - c.downvotes,
        0
      );

      return {
        total: postKarma + commentKarma,
        postKarma,
        commentKarma,
        postCount: posts?.length || 0,
        commentCount: comments?.length || 0,
      };
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async ({
      display_name,
      bio,
      avatar_url,
    }: {
      display_name?: string;
      bio?: string;
      avatar_url?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name,
          bio,
          avatar_url,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
