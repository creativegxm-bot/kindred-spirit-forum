-- Add is_dm column to chat_rooms to distinguish DM rooms from regular chat rooms
ALTER TABLE public.chat_rooms ADD COLUMN is_dm boolean DEFAULT false;

-- Create a function to find or create a DM room between two users
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
  -- Check if a DM room already exists between these two users
  SELECT cr.id INTO existing_room_id
  FROM chat_rooms cr
  WHERE cr.is_dm = true
    AND EXISTS (
      SELECT 1 FROM chat_room_members m1 
      WHERE m1.room_id = cr.id AND m1.user_id = current_user_id
    )
    AND EXISTS (
      SELECT 1 FROM chat_room_members m2 
      WHERE m2.room_id = cr.id AND m2.user_id = other_user_id
    )
  LIMIT 1;

  IF existing_room_id IS NOT NULL THEN
    RETURN existing_room_id;
  END IF;

  -- Get the other user's username for the room name
  SELECT username INTO other_username FROM profiles WHERE user_id = other_user_id;

  -- Create a new DM room
  INSERT INTO chat_rooms (name, is_private, is_dm, created_by, icon)
  VALUES ('DM', true, true, current_user_id, '💬')
  RETURNING id INTO new_room_id;

  -- Add both users as members
  INSERT INTO chat_room_members (room_id, user_id) VALUES (new_room_id, current_user_id);
  INSERT INTO chat_room_members (room_id, user_id) VALUES (new_room_id, other_user_id);

  RETURN new_room_id;
END;
$$;

-- Update RLS policy for chat_rooms to allow viewing DM rooms you're a member of
DROP POLICY IF EXISTS "Private rooms viewable by members" ON public.chat_rooms;
CREATE POLICY "Private rooms viewable by members"
ON public.chat_rooms
FOR SELECT
USING (
  (is_private = true OR is_dm = true) 
  AND EXISTS (
    SELECT 1 FROM chat_room_members 
    WHERE chat_room_members.room_id = chat_rooms.id 
    AND chat_room_members.user_id = auth.uid()
  )
);

-- Update RLS for chat_room_members to allow the DM function to add members
DROP POLICY IF EXISTS "Users can join rooms they're allowed to join" ON public.chat_room_members;
CREATE POLICY "Users can join rooms they're allowed to join"
ON public.chat_room_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    -- User is adding themselves to a public room
    (user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM chat_rooms WHERE id = room_id AND is_private = false AND is_dm = false
    ))
    OR
    -- Room creator adding themselves or others to their room
    EXISTS (
      SELECT 1 FROM chat_rooms WHERE id = room_id AND created_by = auth.uid()
    )
  )
);