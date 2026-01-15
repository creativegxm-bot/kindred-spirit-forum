import { TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunities } from "@/hooks/usePosts";

const TrendingSidebar = () => {
  const { data: communities = [] } = useCommunities();

  const formatMembers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + "k";
    }
    return count.toString();
  };

  return (
    <aside className="hidden xl:block w-80 space-y-4">
      <div className="card-gradient rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Trend Topluluklar</h3>
        </div>
        <div className="space-y-3">
          {communities.slice(0, 5).map((community, index) => (
            <div
              key={community.id}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <span className="text-sm font-medium text-muted-foreground w-4">
                {index + 1}
              </span>
              <span className="text-2xl">{community.icon || "💬"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                  r/{community.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {formatMembers(community.member_count)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Katıl
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="card-gradient rounded-lg border border-border p-4">
        <h3 className="font-semibold mb-3">Readit Hakkında</h3>
        <p className="text-sm text-muted-foreground mb-4">
          İnternetin ön sayfası. Topluluklara katıl, içerik paylaş ve milyonlarca
          kullanıcıyla bağlantı kur.
        </p>
        <Button className="w-full" variant="create">
          Topluluk Oluştur
        </Button>
      </div>

      <div className="text-xs text-muted-foreground p-4 space-y-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <a href="#" className="hover:underline">Yardım</a>
          <a href="#" className="hover:underline">Hakkında</a>
          <a href="#" className="hover:underline">Kariyer</a>
          <a href="#" className="hover:underline">Basın</a>
          <a href="#" className="hover:underline">Blog</a>
        </div>
        <p>© 2024 Readit, Inc. Tüm hakları saklıdır.</p>
      </div>
    </aside>
  );
};

export default TrendingSidebar;
