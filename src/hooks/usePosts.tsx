import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PostMedia {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  sort_order: number;
}

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
  media?: PostMedia[];
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  banner_url: string | null;
  member_count: number;
  created_by: string | null;
  created_at: string;
}

const POSTS_PER_PAGE = 10;

export const usePosts = (languageCode?: string) => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ["posts", user?.id, languageCode],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("posts")
        .select(`
          *,
          community:communities(name, icon)
        `)
        .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1);
      
      if (languageCode) {
        query = query.eq("language_code", languageCode);
      }
      
      const { data: posts, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      if (!posts || posts.length === 0) return { posts: [] as Post[], nextPage: undefined };

      const authorIds = [...new Set(posts.map(p => p.author_id))];
      const postIds = posts.map(p => p.id);

      const [profilesRes, mediaRes, votesRes, savedRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", authorIds),
        supabase
          .from("post_media")
          .select("*")
          .in("post_id", postIds)
          .order("sort_order", { ascending: true }),
        user
          ? supabase
              .from("votes")
              .select("post_id, vote_type")
              .eq("user_id", user.id)
              .not("post_id", "is", null)
          : Promise.resolve({ data: null }),
        user
          ? supabase
              .from("saved_posts")
              .select("post_id")
              .eq("user_id", user.id)
          : Promise.resolve({ data: null }),
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);

      const mediaMap = new Map<string, PostMedia[]>();
      (mediaRes.data || []).forEach(m => {
        const list = mediaMap.get(m.post_id) || [];
        list.push(m as PostMedia);
        mediaMap.set(m.post_id, list);
      });

      const voteMap = new Map(votesRes.data?.map((v) => [v.post_id, v.vote_type]) || []);
      const savedSet = new Set(savedRes.data?.map((s) => s.post_id) || []);

      const mappedPosts = posts.map(post => ({
        ...post,
        author: profileMap.get(post.author_id) || { username: "deleted", avatar_url: null },
        media: mediaMap.get(post.id) || [],
        user_vote: voteMap.get(post.id) ?? null,
        is_saved: savedSet.has(post.id),
      })) as Post[];

      return {
        posts: mappedPosts,
        nextPage: posts.length === POSTS_PER_PAGE ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export const useCommunities = (languageCode?: string) => {
  return useQuery({
    queryKey: ["communities", languageCode],
    queryFn: async () => {
      let query = supabase
        .from("communities")
        .select("*");
      
      if (languageCode) {
        query = query.eq("language_code", languageCode);
      }
      
      const { data, error } = await query.order("member_count", { ascending: false });

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
      language_code,
      image_url,
      link_url,
      media_items,
    }: {
      title: string;
      content?: string;
      community_id: string;
      language_code?: string;
      image_url?: string;
      link_url?: string;
      media_items?: { url: string; type: "image" | "video" }[];
    }) => {
      if (!user) throw new Error("Must be logged in to create a post");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          title,
          content,
          community_id,
          language_code: language_code || "tr",
          image_url,
          link_url,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert media items into post_media table
      if (media_items && media_items.length > 0) {
        const mediaRows = media_items.map((item, index) => ({
          post_id: data.id,
          media_url: item.url,
          media_type: item.type,
          sort_order: index,
        }));

        const { error: mediaError } = await supabase
          .from("post_media")
          .insert(mediaRows);

        if (mediaError) console.error("Failed to insert post media:", mediaError);
      }

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

export const useUploadPostMedia = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: "image" | "video" }) => {
      if (!user) throw new Error("Must be logged in to upload");

      const maxSize = type === "image" ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB images, 100MB videos
      if (file.size > maxSize) {
        throw new Error(type === "image" ? "Image must be under 10MB" : "Video must be under 100MB");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("post-media")
        .getPublicUrl(fileName);

      return { url: data.publicUrl, type };
    },
  });
};
