-- Create a function to call the edge function for email notifications
CREATE OR REPLACE FUNCTION public.call_comment_email_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Call the edge function via pg_net (async HTTP request)
  PERFORM net.http_post(
    url := 'https://prksphzxxawvaootvwau.supabase.co/functions/v1/send-comment-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'comments',
      'record', jsonb_build_object(
        'id', NEW.id,
        'post_id', NEW.post_id,
        'author_id', NEW.author_id,
        'content', NEW.content,
        'parent_id', NEW.parent_id,
        'created_at', NEW.created_at
      )
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger to call the function on new comments
DROP TRIGGER IF EXISTS trigger_comment_email_notification ON public.comments;
CREATE TRIGGER trigger_comment_email_notification
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.call_comment_email_notification();