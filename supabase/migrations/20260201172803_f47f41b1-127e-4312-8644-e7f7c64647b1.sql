-- Fix 1: Add database constraints for input validation
ALTER TABLE posts 
  ADD CONSTRAINT posts_title_length CHECK (char_length(title) > 0 AND char_length(title) <= 300),
  ADD CONSTRAINT posts_content_length CHECK (content IS NULL OR char_length(content) <= 40000);

ALTER TABLE comments
  ADD CONSTRAINT comments_content_length CHECK (char_length(content) > 0 AND char_length(content) <= 10000);

ALTER TABLE profiles
  ADD CONSTRAINT profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 200),
  ADD CONSTRAINT profiles_display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 100);

ALTER TABLE communities
  ADD CONSTRAINT communities_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 50),
  ADD CONSTRAINT communities_description_length CHECK (description IS NULL OR char_length(description) <= 500);

ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_content_length CHECK (char_length(content) > 0 AND char_length(content) <= 5000);

-- Fix 2: Replace overly permissive notifications INSERT policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated system can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 3: Improve find_or_create_dm_room function with validation
CREATE OR REPLACE FUNCTION public.find_or_create_dm_room(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  existing_room_id uuid;
  new_room_id uuid;
  other_username text;
BEGIN
  -- Validate current user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate other_user_id is not null
  IF other_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;

  -- Validate other_user_id is not the current user
  IF other_user_id = current_user_id THEN
    RAISE EXCEPTION 'Cannot create DM with yourself';
  END IF;

  -- Validate other user exists
  SELECT username INTO other_username FROM profiles WHERE user_id = other_user_id;
  IF other_username IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if a DM room already exists between these users
  SELECT cr.id INTO existing_room_id
  FROM chat_rooms cr
  WHERE cr.is_dm = true
    AND EXISTS (
      SELECT 1 FROM chat_room_members crm1 
      WHERE crm1.room_id = cr.id AND crm1.user_id = current_user_id
    )
    AND EXISTS (
      SELECT 1 FROM chat_room_members crm2 
      WHERE crm2.room_id = cr.id AND crm2.user_id = other_user_id
    );

  IF existing_room_id IS NOT NULL THEN
    RETURN existing_room_id;
  END IF;

  -- Create new DM room
  INSERT INTO chat_rooms (name, is_dm, is_private, created_by, icon)
  VALUES ('DM', true, true, current_user_id, '💬')
  RETURNING id INTO new_room_id;

  -- Add both users as members
  INSERT INTO chat_room_members (room_id, user_id)
  VALUES (new_room_id, current_user_id), (new_room_id, other_user_id);

  RETURN new_room_id;
END;
$$;