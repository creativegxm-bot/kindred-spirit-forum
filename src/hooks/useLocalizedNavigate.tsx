import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Returns a navigate function that auto-prefixes paths with the current language.
 * Also provides a `localePath` helper for building <Link to={...}> paths.
 */
export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const localePath = useCallback(
    (path: string) => {
      // If path already starts with a language prefix, return as-is
      if (path.match(/^\/(tr|en|de|fr|es|hi|zh|ja|pt|ru|it|he)(\/|$)/)) {
        return path;
      }
      // Ensure path starts with /
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return `/${language}${cleanPath}`;
    },
    [language]
  );

  const localizedNavigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      navigate(localePath(path), options);
    },
    [navigate, localePath]
  );

  return { navigate: localizedNavigate, localePath };
};
