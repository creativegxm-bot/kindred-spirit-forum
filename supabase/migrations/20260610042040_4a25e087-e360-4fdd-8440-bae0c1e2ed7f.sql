
-- Drop all legacy tables
DROP TABLE IF EXISTS
  advertise_inquiries, blog_post_seo,
  chat_message_reactions, chat_messages, chat_room_invites,
  chat_room_members, chat_rooms,
  children_stories, comments, communities, community_members, community_rules,
  detection_results, draw_entries, email_aliases, iq_test_results,
  job_listings, newsletter_signups, notifications, pending_ai_comments,
  post_media, posts, roommate_listings, saved_posts, votes
CASCADE;

-- Drop legacy functions (triggers removed via CASCADE above)
DROP FUNCTION IF EXISTS public.notify_on_comment() CASCADE;
DROP FUNCTION IF EXISTS public.notify_on_vote() CASCADE;
DROP FUNCTION IF EXISTS public.update_post_comment_count() CASCADE;
DROP FUNCTION IF EXISTS public.set_comment_language_code() CASCADE;
DROP FUNCTION IF EXISTS public.update_comment_vote_counts() CASCADE;
DROP FUNCTION IF EXISTS public.find_or_create_dm_room(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_room_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_public_room(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_draw_entry_count() CASCADE;
DROP FUNCTION IF EXISTS public.detect_language_and_assign_country(text) CASCADE;

-- New game stats table
CREATE TABLE public.game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_slug text NOT NULL,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  best_time_seconds integer,
  best_score integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_stats TO authenticated;
GRANT ALL ON public.game_stats TO service_role;

ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own stats" ON public.game_stats
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stats" ON public.game_stats
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON public.game_stats
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER game_stats_set_updated_at
BEFORE UPDATE ON public.game_stats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
