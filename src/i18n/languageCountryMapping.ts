import { Language } from "./translations";

// Language to primary country mapping (reverse of countryToLanguage)
export const languageToCountry: Record<Language, string> = {
  tr: "TR",
  en: "US",
  de: "DE",
  fr: "FR",
  es: "ES",
  hi: "IN",
  zh: "CN",
  ja: "JP",
  pt: "BR",
  ru: "RU",
  it: "IT",
  he: "IL",
};

// Language display names
export const languageNames: Record<Language, { native: string; english: string }> = {
  tr: { native: "Türkçe", english: "Turkish" },
  en: { native: "English", english: "English" },
  de: { native: "Deutsch", english: "German" },
  fr: { native: "Français", english: "French" },
  es: { native: "Español", english: "Spanish" },
  hi: { native: "हिन्दी", english: "Hindi" },
  zh: { native: "中文", english: "Chinese" },
  ja: { native: "日本語", english: "Japanese" },
  pt: { native: "Português", english: "Portuguese" },
  ru: { native: "Русский", english: "Russian" },
  it: { native: "Italiano", english: "Italian" },
  he: { native: "עברית", english: "Hebrew" },
};

// All supported languages
export const SUPPORTED_LANGUAGES: Language[] = [
  "tr", "en", "de", "fr", "es", "hi", "zh", "ja", "pt", "ru", "it", "he"
];
