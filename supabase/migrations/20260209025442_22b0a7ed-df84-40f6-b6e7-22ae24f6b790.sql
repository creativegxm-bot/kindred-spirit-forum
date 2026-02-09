-- Create function to detect language and assign country from post content
CREATE OR REPLACE FUNCTION public.detect_language_and_assign_country(post_content text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  content_lower text;
BEGIN
  content_lower := LOWER(COALESCE(post_content, ''));
  
  -- Turkish detection (common Turkish characters and words)
  IF content_lower ~ '[ğüşıöçĞÜŞİÖÇ]' OR 
     content_lower ~ '\y(ve|ile|bir|bu|için|olan|gibi|daha|çok|kadar|şey|olarak|benim|senin|onun|bizim|sizin|onların)\y' THEN
    RETURN 'TR';
  END IF;
  
  -- Russian detection (Cyrillic characters)
  IF content_lower ~ '[а-яА-ЯёЁ]' THEN
    RETURN 'RU';
  END IF;
  
  -- Chinese detection (CJK characters)
  IF content_lower ~ '[\u4e00-\u9fff]' OR content_lower ~ '[一-龥]' THEN
    RETURN 'CN';
  END IF;
  
  -- Japanese detection (Hiragana and Katakana)
  IF content_lower ~ '[\u3040-\u309f\u30a0-\u30ff]' OR content_lower ~ '[ぁ-んァ-ン]' THEN
    RETURN 'JP';
  END IF;
  
  -- Hindi detection (Devanagari script)
  IF content_lower ~ '[\u0900-\u097f]' OR content_lower ~ '[अ-ह]' THEN
    RETURN 'IN';
  END IF;
  
  -- German detection (common German words)
  IF content_lower ~ '\y(und|der|die|das|ist|ein|eine|mit|auf|für|nicht|sind|werden|haben|werden|auch|nach|bei|wird|kann)\y' AND
     content_lower ~ '[äöüß]' THEN
    RETURN 'DE';
  END IF;
  
  -- French detection (common French words and accents)
  IF content_lower ~ '\y(et|le|la|les|un|une|de|du|des|est|sont|avec|pour|dans|que|qui|sur|mais|comme|cette)\y' AND
     content_lower ~ '[àâçéèêëîïôùûü]' THEN
    RETURN 'FR';
  END IF;
  
  -- Spanish detection (common Spanish words and characters)
  IF content_lower ~ '\y(y|el|la|los|las|un|una|de|del|es|son|con|para|en|que|como|pero|más|esta|este)\y' AND
     content_lower ~ '[áéíóúñ¿¡]' THEN
    RETURN 'ES';
  END IF;
  
  -- Portuguese detection (common Portuguese words)
  IF content_lower ~ '\y(e|o|a|os|as|um|uma|de|do|da|é|são|com|para|em|que|como|mas|mais|esta|este|não)\y' AND
     content_lower ~ '[ãõáéíóúâêôç]' THEN
    RETURN 'BR';
  END IF;
  
  -- Italian detection (common Italian words)
  IF content_lower ~ '\y(e|il|la|i|le|un|una|di|del|della|è|sono|con|per|in|che|come|ma|più|questa|questo|non)\y' AND
     content_lower ~ '[àèéìòù]' THEN
    RETURN 'IT';
  END IF;
  
  -- Default to US (English)
  RETURN 'US';
END;
$$;

-- Migrate existing posts based on content language detection
UPDATE public.posts 
SET country = detect_language_and_assign_country(COALESCE(content, '') || ' ' || COALESCE(title, ''))
WHERE country IS NOT NULL OR country IS NULL;