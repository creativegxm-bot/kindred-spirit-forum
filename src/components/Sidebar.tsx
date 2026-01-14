import { TrendingUp, Flame, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { communities } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const formatMembers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M members";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + "k members";
    }
    return count + " members";
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 bg-sidebar border-r border-border transition-transform duration-300 lg:sticky lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-1 p-3">
          <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Feeds
          </h3>
          <Button variant="ghost" className="justify-start gap-3">
            <Flame className="h-5 w-5 text-upvote" />
            Hot
          </Button>
          <Button variant="ghost" className="justify-start gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Trending
          </Button>
          <Button variant="ghost" className="justify-start gap-3">
            <Clock className="h-5 w-5 text-comment" />
            New
          </Button>
          <Button variant="ghost" className="justify-start gap-3">
            <Star className="h-5 w-5 text-yellow-500" />
            Top
          </Button>
        </div>

        <div className="mt-2 border-t border-border" />

        <div className="flex flex-col gap-1 p-3">
          <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular Communities
          </h3>
          {communities.map((community) => (
            <Button
              key={community.id}
              variant="ghost"
              className="justify-start gap-3 h-auto py-2"
            >
              <span className="text-xl">{community.icon}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">r/{community.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatMembers(community.memberCount)}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
