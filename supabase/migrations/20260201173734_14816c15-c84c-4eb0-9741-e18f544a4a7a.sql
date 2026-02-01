-- Fix 1: Drop the overly permissive votes policy - individual votes should be private
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON public.votes;

-- Fix 2: Drop the notifications INSERT policy entirely
-- Database triggers bypass RLS by default, so they don't need this policy
-- This prevents any client from inserting fake notifications
DROP POLICY IF EXISTS "Authenticated system can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;