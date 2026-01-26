-- Drop the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Room members are viewable by room members" ON public.chat_room_members;

-- Create a corrected policy that properly references the outer table
CREATE POLICY "Room members are viewable by room members" 
ON public.chat_room_members 
FOR SELECT 
USING (
  -- User is a member of the same room (using the outer chat_room_members table)
  (EXISTS ( 
    SELECT 1
    FROM chat_room_members m
    WHERE m.room_id = chat_room_members.room_id 
    AND m.user_id = auth.uid()
  )) 
  OR 
  -- Or it's a public room
  (EXISTS ( 
    SELECT 1
    FROM chat_rooms
    WHERE chat_rooms.id = chat_room_members.room_id 
    AND chat_rooms.is_private = false
  ))
);