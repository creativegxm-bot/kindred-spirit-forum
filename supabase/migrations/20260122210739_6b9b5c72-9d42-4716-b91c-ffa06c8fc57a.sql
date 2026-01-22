-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'vote', 'reply', 'community_post', 'mention')),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Related entities (optional)
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  from_user_id UUID -- The user who triggered the notification
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification on new comment
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id UUID;
  post_title TEXT;
  commenter_username TEXT;
  parent_author_id UUID;
BEGIN
  -- Get post author and title
  SELECT author_id, title INTO post_author_id, post_title
  FROM posts WHERE id = NEW.post_id;
  
  -- Get commenter username
  SELECT username INTO commenter_username
  FROM profiles WHERE user_id = NEW.author_id;
  
  -- If this is a reply to another comment
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO parent_author_id
    FROM comments WHERE id = NEW.parent_id;
    
    -- Notify parent comment author (if not self)
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.author_id THEN
      INSERT INTO notifications (user_id, type, title, message, link, post_id, comment_id, from_user_id)
      VALUES (
        parent_author_id,
        'reply',
        'Yorumunuza yanıt',
        commenter_username || ' yorumunuza yanıt verdi',
        '/r/' || (SELECT name FROM communities WHERE id = (SELECT community_id FROM posts WHERE id = NEW.post_id)),
        NEW.post_id,
        NEW.id,
        NEW.author_id
      );
    END IF;
  END IF;
  
  -- Notify post author (if not self and not already notified as reply)
  IF post_author_id != NEW.author_id AND (NEW.parent_id IS NULL OR post_author_id != parent_author_id) THEN
    INSERT INTO notifications (user_id, type, title, message, link, post_id, comment_id, from_user_id)
    VALUES (
      post_author_id,
      'comment',
      'Gönderinize yorum',
      commenter_username || ' "' || LEFT(post_title, 50) || '" gönderinize yorum yaptı',
      '/r/' || (SELECT name FROM communities WHERE id = (SELECT community_id FROM posts WHERE id = NEW.post_id)),
      NEW.post_id,
      NEW.id,
      NEW.author_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to create notification on vote
CREATE OR REPLACE FUNCTION public.notify_on_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  post_title TEXT;
  voter_username TEXT;
  vote_text TEXT;
BEGIN
  -- Only notify on upvotes
  IF NEW.vote_type != 1 THEN
    RETURN NEW;
  END IF;
  
  -- Get voter username
  SELECT username INTO voter_username
  FROM profiles WHERE user_id = NEW.user_id;
  
  IF NEW.post_id IS NOT NULL THEN
    -- Vote on post
    SELECT author_id, title INTO target_user_id, post_title
    FROM posts WHERE id = NEW.post_id;
    
    IF target_user_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, link, post_id, from_user_id)
      VALUES (
        target_user_id,
        'vote',
        'Gönderiniz beğenildi',
        voter_username || ' "' || LEFT(post_title, 50) || '" gönderinizi beğendi',
        '/r/' || (SELECT name FROM communities WHERE id = (SELECT community_id FROM posts WHERE id = NEW.post_id)),
        NEW.post_id,
        NEW.user_id
      );
    END IF;
  ELSIF NEW.comment_id IS NOT NULL THEN
    -- Vote on comment
    SELECT author_id INTO target_user_id
    FROM comments WHERE id = NEW.comment_id;
    
    IF target_user_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, link, comment_id, from_user_id)
      VALUES (
        target_user_id,
        'vote',
        'Yorumunuz beğenildi',
        voter_username || ' yorumunuzu beğendi',
        '',
        NEW.comment_id,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_comment_notify
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_comment();

CREATE TRIGGER on_vote_notify
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_vote();