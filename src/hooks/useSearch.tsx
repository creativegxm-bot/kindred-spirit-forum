import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  posts: Array<{
    id: string;
    title: string;
    content: string | null;
    community: { name: string; icon: string | null } | null;
    author?: { username: string };
    created_at: string;
  }>;
  communities: Array<{
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    member_count: number;
  }>;
  users: Array<{
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  }>;
}

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async (): Promise<SearchResult> => {
      if (!query || query.length < 2) {
        return { posts: [], communities: [], users: [] };
      }

      const searchTerm = `%${query}%`;

      // Search posts
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          content,
          created_at,
          community:communities(name, icon)
        `)
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (postsError) console.error("Posts search error:", postsError);

      // Get author profiles for posts
      let postsWithAuthors = posts || [];
      if (posts && posts.length > 0) {
        const { data: postAuthors } = await supabase
          .from("posts")
          .select("id, author_id")
          .in("id", posts.map(p => p.id));
        
        const authorIds = [...new Set((postAuthors || []).map(p => p.author_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", authorIds);
        
        const authorMap = new Map((postAuthors || []).map(p => [p.id, p.author_id]));
        const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
        
        postsWithAuthors = posts.map(post => ({
          ...post,
          author: profileMap.get(authorMap.get(post.id) || "") || { username: "deleted" }
        }));
      }

      // Search communities
      const { data: communities, error: communitiesError } = await supabase
        .from("communities")
        .select("id, name, description, icon, member_count")
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order("member_count", { ascending: false })
        .limit(5);

      if (communitiesError) console.error("Communities search error:", communitiesError);

      // Search users
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
        .limit(5);

      if (usersError) console.error("Users search error:", usersError);

      return {
        posts: postsWithAuthors,
        communities: communities || [],
        users: users || [],
      };
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });
};
