-- Create chat_room_invites table for private room invitations
CREATE TABLE public.chat_room_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (room_id, invited_user_id)
);

-- Enable RLS
ALTER TABLE public.chat_room_invites ENABLE ROW LEVEL SECURITY;

-- Invited users can view their invites
CREATE POLICY "Users can view invites sent to them"
ON public.chat_room_invites
FOR SELECT
USING (invited_user_id = auth.uid());

-- Room creators can view all invites for their rooms
CREATE POLICY "Room creators can view room invites"
ON public.chat_room_invites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE chat_rooms.id = chat_room_invites.room_id 
    AND chat_rooms.created_by = auth.uid()
  )
);

-- Room creators can create invites for their private rooms
CREATE POLICY "Room creators can invite to their private rooms"
ON public.chat_room_invites
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND invited_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE chat_rooms.id = chat_room_invites.room_id 
    AND chat_rooms.created_by = auth.uid()
    AND chat_rooms.is_private = true
  )
);

-- Invited users can update their invite status (accept/decline)
CREATE POLICY "Invited users can respond to invites"
ON public.chat_room_invites
FOR UPDATE
USING (invited_user_id = auth.uid() AND status = 'pending');

-- Room creators can delete/revoke invites
CREATE POLICY "Room creators can revoke invites"
ON public.chat_room_invites
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE chat_rooms.id = chat_room_invites.room_id 
    AND chat_rooms.created_by = auth.uid()
  )
);

-- Update chat_room_members RLS to allow invited users to join
DROP POLICY IF EXISTS "Users can join rooms they're allowed to join" ON public.chat_room_members;

CREATE POLICY "Users can join rooms they're allowed to join"
ON public.chat_room_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND (
    -- User joining a public non-DM room
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = room_id AND is_private = false AND is_dm = false
    )
    OR
    -- Room creator can add themselves
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = room_id AND created_by = auth.uid()
    )
    OR
    -- User has an accepted invite to this private room
    EXISTS (
      SELECT 1 FROM chat_room_invites
      WHERE chat_room_invites.room_id = chat_room_members.room_id
      AND chat_room_invites.invited_user_id = auth.uid()
      AND chat_room_invites.status = 'accepted'
    )
  )
);

-- Enable realtime for invites
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_invites;