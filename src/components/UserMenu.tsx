import { User, LogOut, Settings, Bookmark, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  onOpenAuth: (mode: "login" | "signup") => void;
}

const UserMenu = ({ onOpenAuth }: UserMenuProps) => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex"
          onClick={() => onOpenAuth("login")}
        >
          Log In
        </Button>
        <Button
          variant="create"
          size="sm"
          onClick={() => onOpenAuth("signup")}
        >
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium">
              {profile?.username || "User"}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {profile?.karma || 0} karma
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{profile?.display_name || profile?.username}</span>
            <span className="text-xs font-normal text-muted-foreground">
              u/{profile?.username}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/u/${profile?.username}`)}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/saved")}>
          <Bookmark className="mr-2 h-4 w-4" />
          Saved Posts
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/u/${profile?.username}`)}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
