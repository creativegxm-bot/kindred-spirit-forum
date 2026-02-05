-- Drop the problematic trigger that uses pg_net (which is not available)
DROP TRIGGER IF EXISTS trigger_comment_email_notification ON public.comments;

-- Drop the function as well since it won't work without pg_net
DROP FUNCTION IF EXISTS public.call_comment_email_notification();