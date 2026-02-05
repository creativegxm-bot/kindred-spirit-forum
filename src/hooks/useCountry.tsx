import React, { createContext, useContext, useState, ReactNode } from "react";
import { COUNTRIES, Country } from "@/components/CountryFilter";
import { useLanguage } from "@/hooks/useLanguage";
import { countryToLanguage, Language } from "@/i18n/translations";

interface CountryContextType {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  getCountryInfo: (code: string) => Country | undefined;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const { setLanguage } = useLanguage();
  
  const [selectedCountry, setSelectedCountryState] = useState<string>(() => {
    const saved = localStorage.getItem("selectedCountry");
    return saved || "TR";
  });

  const setSelectedCountry = (country: string) => {
    setSelectedCountryState(country);
    localStorage.setItem("selectedCountry", country);
    
    // Auto-switch language based on country
    const targetLanguage = countryToLanguage[country];
    if (targetLanguage) {
      setLanguage(targetLanguage);
    }
  };

  const getCountryInfo = (code: string) => {
    return COUNTRIES.find(c => c.code === code);
  };

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry, getCountryInfo }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
};
