import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Menu, Home } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NotificationDropdown from "@/components/NotificationDropdown";
import ChatRoomList from "@/components/chat/ChatRoomList";
import ChatRoomView from "@/components/chat/ChatRoomView";
import CreateChatRoomModal from "@/components/chat/CreateChatRoomModal";
import AuthModal from "@/components/AuthModal";
import ondabirLogo from "@/assets/ondabir-logo.png";

const Chat = () => {
  const { roomId } = useParams();
  const { navigate, localePath } = useLocalizedNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectRoom = (id: string) => {
    navigate(`/chat/${id}`);
    setSidebarOpen(false);
  };

  const handleCreateRoom = () => {
    if (!user) {
      openAuth("login");
      return;
    }
    setCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Header for Chat */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to={localePath("/")} className="flex items-center gap-2">
            <img src={ondabirLogo} alt="ondabir" className="h-8 w-8 rounded" />
            <span className="hidden text-xl font-bold text-gradient sm:block">
              ondabir
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-center px-4">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="w-full bg-secondary border-none pl-10 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={localePath("/")}>
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            {user && (
              <div className="hidden sm:block">
                <NotificationDropdown />
              </div>
            )}
            <LanguageSwitcher />
            <UserMenu onOpenAuth={openAuth} />
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-56px)]">
        {/* Room List Sidebar - Desktop */}
        <div className="hidden lg:flex w-80 border-r border-border bg-card flex-shrink-0">
          <ChatRoomList
            selectedRoomId={roomId}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={handleCreateRoom}
          />
        </div>

        {/* Room List Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
            <div className="w-80 h-full bg-card border-r border-border">
              <ChatRoomList
                selectedRoomId={roomId}
                onSelectRoom={handleSelectRoom}
                onCreateRoom={handleCreateRoom}
              />
            </div>
            <div 
              className="absolute inset-0 -z-10" 
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {roomId ? (
            <ChatRoomView roomId={roomId} onOpenAuth={openAuth} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t("selectChatRoom")}
                </h2>
                <p className="text-muted-foreground">
                  {t("selectChatRoomDesc")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateChatRoomModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default Chat;
