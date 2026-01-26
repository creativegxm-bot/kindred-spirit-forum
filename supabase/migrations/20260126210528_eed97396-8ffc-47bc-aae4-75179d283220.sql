-- Create table for chat message reactions
CREATE TABLE public.chat_message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.chat_message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions on messages they can see
CREATE POLICY "Reactions viewable if message is viewable"
ON public.chat_message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_messages cm
    WHERE cm.id = chat_message_reactions.message_id
    AND (
      EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.id = cm.room_id AND cr.is_private = false)
      OR
      public.is_room_member(cm.room_id, auth.uid())
    )
  )
);

-- Authenticated users can add reactions
CREATE POLICY "Users can add reactions"
ON public.chat_message_reactions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM chat_messages cm
    WHERE cm.id = chat_message_reactions.message_id
    AND (
      EXISTS (SELECT 1 FROM chat_rooms cr WHERE cr.id = cm.room_id AND cr.is_private = false)
      OR
      public.is_room_member(cm.room_id, auth.uid())
    )
  )
);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.chat_message_reactions
FOR DELETE
USING (user_id = auth.uid());

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_message_reactions;