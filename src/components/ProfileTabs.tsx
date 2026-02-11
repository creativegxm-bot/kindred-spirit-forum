import { useState } from "react";
import { ArrowBigUp, ArrowBigDown, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPost, UserComment } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";

interface ProfileTabsProps {
  posts: UserPost[] | undefined;
  comments: UserComment[] | undefined;
  isLoading: boolean;
}

const ProfileTabs = ({ posts, comments, isLoading }: ProfileTabsProps) => {
  const { navigate } = useLocalizedNavigate();

  if (isLoading) {
    return (
      <div className="card-gradient rounded-lg border border-border p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-1/3 mx-auto" />
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full grid grid-cols-2 bg-secondary">
        <TabsTrigger value="posts">Gönderiler ({posts?.length || 0})</TabsTrigger>
        <TabsTrigger value="comments">Yorumlar ({comments?.length || 0})</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-4 space-y-3">
        {posts?.length === 0 ? (
          <div className="card-gradient rounded-lg border border-border p-8 text-center text-muted-foreground">
            Henüz gönderi yok
          </div>
        ) : (
          posts?.map((post) => (
            <div
              key={post.id}
              className="card-gradient rounded-lg border border-border p-4 hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => navigate("/")}
            >
              <div className="flex gap-3">
                <div className="flex flex-col items-center text-sm">
                  <ArrowBigUp className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{post.upvotes - post.downvotes}</span>
                  <ArrowBigDown className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.community?.icon}</span>
                    <span>r/{post.community?.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: tr })}</span>
                  </div>
                  <h3 className="font-semibold mt-1 line-clamp-2">{post.title}</h3>
                  {post.content && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {post.content}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.comment_count} yorum
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="comments" className="mt-4 space-y-3">
        {comments?.length === 0 ? (
          <div className="card-gradient rounded-lg border border-border p-8 text-center text-muted-foreground">
            Henüz yorum yok
          </div>
        ) : (
          comments?.map((comment) => (
            <div
              key={comment.id}
              className="card-gradient rounded-lg border border-border p-4 hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => navigate("/")}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Şuna yorum yapıldı:</span>
                <span className="font-medium text-foreground truncate">
                  {comment.post?.title || "silinen gönderi"}
                </span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}</span>
              </div>
              <p className="text-sm line-clamp-3">{comment.content}</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <ArrowBigUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{comment.upvotes - comment.downvotes}</span>
                <ArrowBigDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
