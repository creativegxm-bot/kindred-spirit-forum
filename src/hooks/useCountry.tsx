import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { COUNTRIES, Country } from "@/components/CountryFilter";

interface CountryContextType {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  getCountryInfo: (code: string) => Country | undefined;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCountry, setSelectedCountryState] = useState<string>(() => {
    const saved = localStorage.getItem("selectedCountry");
    return saved || "TR";
  });

  const setSelectedCountry = (country: string) => {
    setSelectedCountryState(country);
    localStorage.setItem("selectedCountry", country);
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
