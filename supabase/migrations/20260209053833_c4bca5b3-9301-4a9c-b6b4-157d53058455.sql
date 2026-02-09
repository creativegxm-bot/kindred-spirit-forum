
-- Improved language detection function that prioritizes content language over title
CREATE OR REPLACE FUNCTION public.detect_language_and_assign_country(post_content text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  content_lower text;
  turkish_pattern text;
  english_words_count integer;
  turkish_words_count integer;
BEGIN
  content_lower := LOWER(COALESCE(post_content, ''));
  
  -- If content is very short, default to TR
  IF LENGTH(content_lower) < 20 THEN
    RETURN 'TR';
  END IF;
  
  -- Turkish detection - strong pattern with Turkish-specific characters
  IF content_lower ~ '[ğüşıöçĞÜŞİÖÇ]' THEN
    RETURN 'TR';
  END IF;
  
  -- Turkish detection - common Turkish words without special characters
  IF content_lower ~ '\y(ve|ile|bir|bu|icin|olan|gibi|daha|cok|kadar|sey|olarak|benim|senin|onun|bizim|sizin|onlarin|artik|simdi|nasil|neden|zaman|yok|var|olmak|etmek|yapmak|gelmek|gitmek)\y' THEN
    -- Count Turkish words
    turkish_words_count := (
      SELECT COUNT(*) FROM regexp_matches(content_lower, '\y(ve|ile|bir|bu|icin|olan|gibi|daha|cok|kadar|sey|olarak|artik|simdi|nasil|neden|zaman|yok|var)\y', 'g')
    );
    
    IF turkish_words_count >= 3 THEN
      RETURN 'TR';
    END IF;
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
  
  -- German detection
  IF content_lower ~ '[äöüß]' AND
     content_lower ~ '\y(und|der|die|das|ist|ein|eine|mit|auf|für|nicht|sind|werden|haben|auch|nach|bei|wird|kann)\y' THEN
    RETURN 'DE';
  END IF;
  
  -- French detection
  IF content_lower ~ '[àâçéèêëîïôùûü]' AND
     content_lower ~ '\y(et|le|la|les|un|une|de|du|des|est|sont|avec|pour|dans|que|qui|sur|mais|comme|cette)\y' THEN
    RETURN 'FR';
  END IF;
  
  -- Spanish detection
  IF content_lower ~ '[áéíóúñ¿¡]' AND
     content_lower ~ '\y(y|el|la|los|las|un|una|de|del|es|son|con|para|en|que|como|pero|más|esta|este)\y' THEN
    RETURN 'ES';
  END IF;
  
  -- Portuguese detection
  IF content_lower ~ '[ãõáéíóúâêôç]' AND
     content_lower ~ '\y(e|o|a|os|as|um|uma|de|do|da|é|são|com|para|em|que|como|mas|mais|esta|este|não)\y' THEN
    RETURN 'BR';
  END IF;
  
  -- Italian detection
  IF content_lower ~ '[àèéìòù]' AND
     content_lower ~ '\y(e|il|la|i|le|un|una|di|del|della|è|sono|con|per|in|che|come|ma|più|questa|questo|non)\y' THEN
    RETURN 'IT';
  END IF;
  
  -- If content has common English patterns (long content without special chars), assign to US
  IF LENGTH(content_lower) > 100 AND
     content_lower ~ '\y(the|is|are|was|were|have|has|been|will|would|could|should|this|that|these|those|with|from|about|into|through|during|before|after|above|below|between|under|again|further|then|once|here|there|when|where|why|how|all|each|few|more|most|other|some|such|only|same|than|very|just|also|now|new|like|time|people|year|way|day|man|thing|woman|life|child|world|school|state|family|student|group|country|problem|hand|part|place|case|week|company|system|program|question|work|government|number|night|point|home|water|room|mother|area|money|story|fact|month|lot|right|study|book|eye|job|word|business|issue|side|kind|head|house|service|friend|father|power|hour|game|line|end|member|law|car|city|community|name|president|team|minute|idea|kid|body|information|back|parent|face|others|level|office|door|health|person|art|war|history|party|result|change|morning|reason|research|girl|guy|moment|air|teacher|force|education)\y' THEN
    RETURN 'US';
  END IF;
  
  -- Default to TR for short content or ambiguous cases
  RETURN 'TR';
END;
$$;

-- Re-migrate posts with the improved detection
-- Focus on posts that have content (not just titles)
UPDATE public.posts 
SET country = detect_language_and_assign_country(COALESCE(content, '') || ' ' || COALESCE(title, ''))
WHERE content IS NOT NULL AND LENGTH(content) > 50;
