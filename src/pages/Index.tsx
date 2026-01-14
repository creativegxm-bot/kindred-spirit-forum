import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TrendingSidebar from "@/components/TrendingSidebar";
import PostCard from "@/components/PostCard";
import PostDetail from "@/components/PostDetail";
import CreatePostModal from "@/components/CreatePostModal";
import { posts } from "@/data/mockData";
import { Post } from "@/types";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => setCreateModalOpen(true)}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 py-4 px-4 lg:px-6">
          <div className="flex gap-6 justify-center">
            <div className="w-full max-w-2xl space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>

            <TrendingSidebar />
          </div>
        </main>
      </div>

      {selectedPost && (
        <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};

export default Index;
