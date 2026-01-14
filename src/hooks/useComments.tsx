import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  author?: {
    username: string;
    avatar_url: string | null;
  };
  user_vote?: number | null;
  replies?: Comment[];
}

export const useComments = (postId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["comments", postId, user?.id],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set((comments || []).map((c) => c.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      let commentsWithAuthors = (comments || []).map((comment) => ({
        ...comment,
        author: profileMap.get(comment.author_id) || {
          username: "deleted",
          avatar_url: null,
        },
      }));

      // Fetch user votes if logged in
      if (user) {
        const commentIds = commentsWithAuthors.map((c) => c.id);
        const { data: votes } = await supabase
          .from("votes")
          .select("comment_id, vote_type")
          .eq("user_id", user.id)
          .in("comment_id", commentIds);

        const voteMap = new Map(
          votes?.map((v) => [v.comment_id, v.vote_type]) || []
        );

        commentsWithAuthors = commentsWithAuthors.map((comment) => ({
          ...comment,
          user_vote: voteMap.get(comment.id) ?? null,
        }));
      }

      // Build nested tree structure
      const buildTree = (
        comments: Comment[],
        parentId: string | null = null
      ): Comment[] => {
        return comments
          .filter((c) => c.parent_id === parentId)
          .map((comment) => ({
            ...comment,
            replies: buildTree(comments, comment.id),
          }));
      };

      return buildTree(commentsWithAuthors as Comment[]);
    },
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      post_id,
      content,
      parent_id,
    }: {
      post_id: string;
      content: string;
      parent_id?: string | null;
    }) => {
      if (!user) throw new Error("Must be logged in to comment");

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id,
          content,
          parent_id: parent_id || null,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.post_id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useCommentVote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      comment_id,
      post_id,
      vote_type,
    }: {
      comment_id: string;
      post_id: string;
      vote_type: 1 | -1 | null;
    }) => {
      if (!user) throw new Error("Must be logged in to vote");

      if (vote_type === null) {
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", comment_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("votes").upsert(
          { user_id: user.id, comment_id, vote_type },
          { onConflict: "user_id,comment_id" }
        );
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.post_id] });
    },
  });
};
