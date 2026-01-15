import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Post } from "./usePosts";

export const useSavedPosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get saved post IDs
      const { data: savedPostsData, error: savedError } = await supabase
        .from("saved_posts")
        .select("post_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (savedError) throw savedError;
      if (!savedPostsData || savedPostsData.length === 0) return [];

      const postIds = savedPostsData.map((s) => s.post_id);

      // Fetch the actual posts
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          community:communities(name, icon)
        `)
        .in("id", postIds);

      if (postsError) throw postsError;

      // Fetch author profiles
      const authorIds = [...new Set((posts || []).map((p) => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      // Fetch user's votes on these posts
      const { data: votes } = await supabase
        .from("votes")
        .select("post_id, vote_type")
        .eq("user_id", user.id)
        .in("post_id", postIds);

      const voteMap = new Map(votes?.map((v) => [v.post_id, v.vote_type]));

      // Create a map for ordering by saved date
      const savedOrderMap = new Map(
        savedPostsData.map((s, index) => [s.post_id, index])
      );

      const postsWithDetails = (posts || [])
        .map((post) => ({
          ...post,
          author: profileMap.get(post.author_id) || {
            username: "deleted",
            avatar_url: null,
          },
          user_vote: voteMap.get(post.id) ?? null,
          is_saved: true,
        }))
        .sort(
          (a, b) =>
            (savedOrderMap.get(a.id) ?? 0) - (savedOrderMap.get(b.id) ?? 0)
        );

      return postsWithDetails as Post[];
    },
    enabled: !!user,
  });
};
