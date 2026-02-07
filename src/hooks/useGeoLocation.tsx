import { useEffect, useState } from "react";
import { countryToLanguage, Language } from "@/i18n/translations";

interface GeoLocationData {
  country: string;
  countryCode: string;
  isLoading: boolean;
  error: string | null;
}

// Map common country codes to our supported country codes
const countryCodeMapping: Record<string, string> = {
  TR: "TR",
  US: "US",
  GB: "GB",
  UK: "GB",
  DE: "DE",
  FR: "FR",
  ES: "ES",
  IN: "IN",
  CN: "CN",
  JP: "JP",
  BR: "BR",
  RU: "RU",
  IT: "IT",
};

export const useGeoLocation = () => {
  const [geoData, setGeoData] = useState<GeoLocationData>({
    country: "",
    countryCode: "",
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const detectLocation = async () => {
      // Check if user has already manually selected a country
      const savedCountry = localStorage.getItem("selectedCountry");
      const hasManualSelection = localStorage.getItem("hasManualCountrySelection");
      
      if (savedCountry && hasManualSelection === "true") {
        setGeoData({
          country: "",
          countryCode: savedCountry,
          isLoading: false,
          error: null,
        });
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
          
          // Save detected country if no manual selection exists
          if (!savedCountry) {
            localStorage.setItem("selectedCountry", detectedCode);
          }
          
          setGeoData({
            country: data.country,
            countryCode: detectedCode,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error("Location detection failed");
        }
      } catch (error) {
        console.log("Geolocation detection failed, using default:", error);
        // Default to Turkey if detection fails
        const defaultCode = savedCountry || "TR";
        setGeoData({
          country: "",
          countryCode: defaultCode,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    detectLocation();
  }, []);

  const getDetectedLanguage = (): Language => {
    return countryToLanguage[geoData.countryCode] || "en";
  };

  return {
    ...geoData,
    getDetectedLanguage,
  };
};
