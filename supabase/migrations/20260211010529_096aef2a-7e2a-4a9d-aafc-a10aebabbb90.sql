
-- Step 1: Add language_code column to posts, migrate data from country
ALTER TABLE public.posts ADD COLUMN language_code text DEFAULT 'tr';

-- Migrate existing country values to language_code
UPDATE public.posts SET language_code = CASE country
  WHEN 'TR' THEN 'tr'
  WHEN 'US' THEN 'en'
  WHEN 'GB' THEN 'en'
  WHEN 'DE' THEN 'de'
  WHEN 'FR' THEN 'fr'
  WHEN 'ES' THEN 'es'
  WHEN 'IN' THEN 'hi'
  WHEN 'CN' THEN 'zh'
  WHEN 'JP' THEN 'ja'
  WHEN 'BR' THEN 'pt'
  WHEN 'RU' THEN 'ru'
  WHEN 'IT' THEN 'it'
  ELSE 'tr'
END;

-- Make language_code NOT NULL after migration
ALTER TABLE public.posts ALTER COLUMN language_code SET NOT NULL;

-- Drop the old country column
ALTER TABLE public.posts DROP COLUMN country;

-- Step 2: Add language_code column to comments
ALTER TABLE public.comments ADD COLUMN language_code text;

-- Backfill existing comments with their post's language_code
UPDATE public.comments c SET language_code = p.language_code
FROM public.posts p WHERE c.post_id = p.id;

-- Set default and NOT NULL
ALTER TABLE public.comments ALTER COLUMN language_code SET DEFAULT 'tr';
ALTER TABLE public.comments ALTER COLUMN language_code SET NOT NULL;

-- Step 3: Create trigger to auto-inherit language_code from post
CREATE OR REPLACE FUNCTION public.set_comment_language_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT language_code INTO NEW.language_code
  FROM posts WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_comment_language_code_trigger
BEFORE INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.set_comment_language_code();

-- Step 4: Update the detect_language function to return language codes instead of country codes
CREATE OR REPLACE FUNCTION public.detect_language_and_assign_country(post_content text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  content_lower text;
  turkish_words_count integer;
BEGIN
  content_lower := LOWER(COALESCE(post_content, ''));
  
  IF LENGTH(content_lower) < 20 THEN
    RETURN 'tr';
  END IF;
  
  IF content_lower ~ '[ğüşıöçĞÜŞİÖÇ]' THEN
    RETURN 'tr';
  END IF;
  
  IF content_lower ~ '\y(ve|ile|bir|bu|icin|olan|gibi|daha|cok|kadar|sey|olarak|benim|senin|onun|bizim|sizin|onlarin|artik|simdi|nasil|neden|zaman|yok|var|olmak|etmek|yapmak|gelmek|gitmek)\y' THEN
    turkish_words_count := (
      SELECT COUNT(*) FROM regexp_matches(content_lower, '\y(ve|ile|bir|bu|icin|olan|gibi|daha|cok|kadar|sey|olarak|artik|simdi|nasil|neden|zaman|yok|var)\y', 'g')
    );
    IF turkish_words_count >= 3 THEN
      RETURN 'tr';
    END IF;
  END IF;
  
  IF content_lower ~ '[а-яА-ЯёЁ]' THEN RETURN 'ru'; END IF;
  IF content_lower ~ '[\u4e00-\u9fff]' OR content_lower ~ '[一-龥]' THEN RETURN 'zh'; END IF;
  IF content_lower ~ '[\u3040-\u309f\u30a0-\u30ff]' OR content_lower ~ '[ぁ-んァ-ン]' THEN RETURN 'ja'; END IF;
  IF content_lower ~ '[\u0900-\u097f]' OR content_lower ~ '[अ-ह]' THEN RETURN 'hi'; END IF;
  
  IF content_lower ~ '[äöüß]' AND content_lower ~ '\y(und|der|die|das|ist|ein|eine|mit|auf|für|nicht|sind|werden|haben)\y' THEN
    RETURN 'de';
  END IF;
  
  IF content_lower ~ '[àâçéèêëîïôùûü]' AND content_lower ~ '\y(et|le|la|les|un|une|de|du|des|est|sont|avec|pour|dans)\y' THEN
    RETURN 'fr';
  END IF;
  
  IF content_lower ~ '[áéíóúñ¿¡]' AND content_lower ~ '\y(y|el|la|los|las|un|una|de|del|es|son|con|para|en)\y' THEN
    RETURN 'es';
  END IF;
  
  IF content_lower ~ '[ãõáéíóúâêôç]' AND content_lower ~ '\y(e|o|a|os|as|um|uma|de|do|da|é|são|com|para|em|que|não)\y' THEN
    RETURN 'pt';
  END IF;
  
  IF content_lower ~ '[àèéìòù]' AND content_lower ~ '\y(e|il|la|i|le|un|una|di|del|della|è|sono|con|per|in|che|non)\y' THEN
    RETURN 'it';
  END IF;
  
  IF LENGTH(content_lower) > 100 AND content_lower ~ '\y(the|is|are|was|were|have|has|been|will|would|could|should|this|that|with|from|about)\y' THEN
    RETURN 'en';
  END IF;
  
  RETURN 'tr';
END;
$function$;

-- Step 5: Add index for language_code filtering
CREATE INDEX idx_posts_language_code ON public.posts(language_code);
CREATE INDEX idx_comments_language_code ON public.comments(language_code);
