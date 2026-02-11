import { useEffect } from "react";
import { useParams, Outlet, Navigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Language } from "@/i18n/translations";
import { SUPPORTED_LANGUAGES } from "@/i18n/languageCountryMapping";

const LanguageRouteLayout = () => {
  const { lang } = useParams<{ lang: string }>();
  const { setLanguage } = useLanguage();

  const isValidLang = lang && SUPPORTED_LANGUAGES.includes(lang as Language);

  useEffect(() => {
    if (isValidLang) {
      setLanguage(lang as Language);
    }
  }, [lang, isValidLang, setLanguage]);

  if (!isValidLang) {
    return <Navigate to="/tr" replace />;
  }

  return <Outlet />;
};

export default LanguageRouteLayout;
