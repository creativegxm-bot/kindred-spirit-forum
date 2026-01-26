-- First, create a security definer function to check room membership
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM chat_room_members
    WHERE room_id = p_room_id
      AND user_id = p_user_id
  )
$$;

-- Create a function to check if a room is public
CREATE OR REPLACE FUNCTION public.is_public_room(p_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM chat_rooms
    WHERE id = p_room_id
      AND is_private = false
  )
$$;

-- Drop the problematic RLS policy
DROP POLICY IF EXISTS "Room members are viewable by room members" ON public.chat_room_members;

-- Create a corrected policy using security definer functions
CREATE POLICY "Room members are viewable by room members" 
ON public.chat_room_members 
FOR SELECT 
USING (
  public.is_room_member(room_id, auth.uid()) 
  OR 
  public.is_public_room(room_id)
);