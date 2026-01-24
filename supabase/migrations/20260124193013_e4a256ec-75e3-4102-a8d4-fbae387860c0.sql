-- Deduplicate existing memberships (keep the earliest join)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY room_id, user_id ORDER BY joined_at ASC, id ASC) AS rn
  FROM public.chat_room_members
)
DELETE FROM public.chat_room_members m
USING ranked r
WHERE m.id = r.id
  AND r.rn > 1;

-- Prevent duplicates going forward
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chat_room_members_room_user_unique'
      AND conrelid = 'public.chat_room_members'::regclass
  ) THEN
    ALTER TABLE public.chat_room_members
      ADD CONSTRAINT chat_room_members_room_user_unique
      UNIQUE (room_id, user_id);
  END IF;
END $$;