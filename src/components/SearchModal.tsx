import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, FileText, Hash, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearch } from "@/hooks/useSearch";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useSearch(query);
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Reset query when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === "tr" ? "şimdi" : "now";
    if (diffMins < 60) return `${diffMins}${language === "tr" ? "dk" : "m"}`;
    if (diffHours < 24) return `${diffHours}${language === "tr" ? "sa" : "h"}`;
    return `${diffDays}${language === "tr" ? "g" : "d"}`;
  };

  const hasResults = results && (
    results.posts.length > 0 ||
    results.communities.length > 0 ||
    results.users.length > 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">
            {language === "tr" ? "Arama" : "Search"}
          </DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === "tr" ? "Gönderi, topluluk veya kullanıcı ara..." : "Search posts, communities or users..."}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4">
            {query.length < 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>
                  {language === "tr" 
                    ? "Aramaya başlamak için en az 2 karakter yazın" 
                    : "Type at least 2 characters to search"}
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !hasResults ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  {language === "tr" 
                    ? `"${query}" için sonuç bulunamadı` 
                    : `No results found for "${query}"`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Communities */}
                {results.communities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      {language === "tr" ? "Topluluklar" : "Communities"}
                    </h3>
                    <div className="space-y-1">
                      {results.communities.map((community) => (
                        <button
                          key={community.id}
                          onClick={() => handleNavigate(`/r/${community.name}`)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                        >
                          <span className="text-2xl">{community.icon || "💬"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">r/{community.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {community.member_count} {language === "tr" ? "üye" : "members"}
                              {community.description && ` • ${community.description}`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {language === "tr" ? "Kullanıcılar" : "Users"}
                    </h3>
                    <div className="space-y-1">
                      {results.users.map((user) => (
                        <button
                          key={user.user_id}
                          onClick={() => handleNavigate(`/u/${user.username}`)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.username}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-primary-foreground">
                                {user.username[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">u/{user.username}</p>
                            {user.display_name && (
                              <p className="text-sm text-muted-foreground truncate">
                                {user.display_name}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts */}
                {results.posts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {language === "tr" ? "Gönderiler" : "Posts"}
                    </h3>
                    <div className="space-y-1">
                      {results.posts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => handleNavigate(`/r/${post.community?.name}`)}
                          className="w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span>{post.community?.icon || "💬"}</span>
                            <span>r/{post.community?.name}</span>
                            <span>•</span>
                            <span>u/{post.author?.username}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(post.created_at)}</span>
                          </div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          {post.content && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {post.content}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
