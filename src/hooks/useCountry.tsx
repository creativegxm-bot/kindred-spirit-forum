import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { COUNTRIES, Country } from "@/components/CountryFilter";
import { useLanguage } from "@/hooks/useLanguage";
import { countryToLanguage, Language } from "@/i18n/translations";

interface CountryContextType {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  getCountryInfo: (code: string) => Country | undefined;
  isDetecting: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

// Map common country codes to our supported country codes
const countryCodeMapping: Record<string, string> = {
  TR: "TR", US: "US", GB: "GB", UK: "GB", DE: "DE", FR: "FR", ES: "ES",
  IN: "IN", CN: "CN", JP: "JP", BR: "BR", RU: "RU", IT: "IT",
  ID: "ID", PK: "PK", NG: "NG", BD: "BD", MX: "MX", ET: "ET",
  PH: "PH", EG: "EG", CD: "CD", VN: "VN", IR: "IR", TH: "TH",
  ZA: "ZA", TZ: "TZ", KR: "KR", CO: "CO", KE: "KE", AR: "AR",
};

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const { setLanguage } = useLanguage();
  const [isDetecting, setIsDetecting] = useState(true);
  
  const [selectedCountry, setSelectedCountryState] = useState<string>(() => {
    const saved = localStorage.getItem("selectedCountry");
    return saved || "TR";
  });

  // Auto-detect location on first visit
  useEffect(() => {
    const detectLocation = async () => {
      const hasManualSelection = localStorage.getItem("hasManualCountrySelection");
      
      // Skip detection if user has manually selected a country before
      if (hasManualSelection === "true") {
        setIsDetecting(false);
        return;
      }

      try {
        // Using ipapi.co for free geolocation (HTTPS, no API key needed)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error("Failed to fetch location");
        }

        const data = await response.json();
        
        if (data.country_code) {
          const detectedCode = countryCodeMapping[data.country_code] || "US";
          
          // Only set if it's a supported country
          if (COUNTRIES.some(c => c.code === detectedCode)) {
            setSelectedCountryState(detectedCode);
            localStorage.setItem("selectedCountry", detectedCode);
            
            // Auto-switch language based on detected country
            const targetLanguage = countryToLanguage[detectedCode];
            if (targetLanguage) {
              setLanguage(targetLanguage);
            }
          }
        }
      } catch (error) {
        console.log("Geolocation detection failed, using default:", error);
      } finally {
        setIsDetecting(false);
      }
    };

    detectLocation();
  }, [setLanguage]);

  const setSelectedCountry = (country: string) => {
    setSelectedCountryState(country);
    localStorage.setItem("selectedCountry", country);
    localStorage.setItem("hasManualCountrySelection", "true"); // Mark as manually selected
    
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
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry, getCountryInfo, isDetecting }}>
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
