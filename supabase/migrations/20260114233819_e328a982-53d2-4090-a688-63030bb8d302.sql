-- Add unique constraint for comment votes to enable upsert
CREATE UNIQUE INDEX IF NOT EXISTS votes_user_comment_unique ON votes (user_id, comment_id) WHERE comment_id IS NOT NULL;

-- Create function to update comment vote counts
CREATE OR REPLACE FUNCTION public.update_comment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.comment_id IS NOT NULL THEN
      IF NEW.vote_type = 1 THEN
        UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
      ELSE
        UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.comment_id IS NOT NULL THEN
      IF OLD.vote_type = 1 AND NEW.vote_type = -1 THEN
        UPDATE comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.comment_id;
      ELSIF OLD.vote_type = -1 AND NEW.vote_type = 1 THEN
        UPDATE comments SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.comment_id IS NOT NULL THEN
      IF OLD.vote_type = 1 THEN
        UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
      ELSE
        UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create separate triggers for INSERT/UPDATE and DELETE
CREATE TRIGGER update_comment_votes_insert_update_trigger
AFTER INSERT OR UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_comment_vote_counts();

CREATE TRIGGER update_comment_votes_delete_trigger
AFTER DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_comment_vote_counts();

-- Create function to update post comment count
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for post comment count updates
CREATE TRIGGER update_post_comment_count_insert_trigger
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comment_count();

CREATE TRIGGER update_post_comment_count_delete_trigger
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comment_count();