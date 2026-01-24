-- Drop existing insert policies on chat_room_members
DROP POLICY IF EXISTS "Users can join public rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Room creators can add members to private rooms" ON public.chat_room_members;

-- Create a unified policy that allows:
-- 1. Users to join public rooms (they join themselves)
-- 2. Room creators to join their own room (both public and private)
-- 3. Room creators to add members to private rooms
CREATE POLICY "Users can join rooms they're allowed to join"
ON public.chat_room_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    -- User is adding themselves to a public room
    (user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM chat_rooms WHERE id = room_id AND is_private = false
    ))
    OR
    -- Room creator adding themselves or others to their private room
    EXISTS (
      SELECT 1 FROM chat_rooms WHERE id = room_id AND created_by = auth.uid()
    )
  )
);