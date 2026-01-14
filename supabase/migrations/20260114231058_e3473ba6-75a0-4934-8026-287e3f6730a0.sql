-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  karma INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '💬',
  banner_url TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "Communities are viewable by everyone"
ON public.communities FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create communities"
ON public.communities FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
ON public.posts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = author_id);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = author_id);

-- Create votes table
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_post_vote UNIQUE (user_id, post_id),
  CONSTRAINT unique_comment_vote UNIQUE (user_id, comment_id),
  CONSTRAINT vote_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Votes policies
CREATE POLICY "Votes are viewable by everyone"
ON public.votes FOR SELECT
USING (true);

CREATE POLICY "Users can create their own votes"
ON public.votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
ON public.votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.votes FOR DELETE
USING (auth.uid() = user_id);

-- Create saved_posts table
CREATE TABLE public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_saved_post UNIQUE (user_id, post_id)
);

-- Enable RLS on saved_posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Saved posts policies
CREATE POLICY "Users can view their own saved posts"
ON public.saved_posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
ON public.saved_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
ON public.saved_posts FOR DELETE
USING (auth.uid() = user_id);

-- Create community_members table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_membership UNIQUE (user_id, community_id)
);

-- Enable RLS on community_members
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Community members policies
CREATE POLICY "Memberships are viewable by everyone"
ON public.community_members FOR SELECT
USING (true);

CREATE POLICY "Users can join communities"
ON public.community_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
ON public.community_members FOR DELETE
USING (auth.uid() = user_id);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', 'Anonymous')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert default communities
INSERT INTO public.communities (name, description, icon, member_count) VALUES
('programming', 'Computer Programming', '💻', 5200000),
('gaming', 'A community for all things gaming', '🎮', 34000000),
('technology', 'Tech news and discussions', '🔬', 14000000),
('science', 'The pursuit of knowledge', '🧪', 29000000),
('movies', 'Discuss films and filmmaking', '🎬', 28000000),
('music', 'The musical side of the internet', '🎵', 31000000);