"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionary, type Locale } from "./dictionary";

type LangContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  d: (typeof dictionary)["hi"];
};

const LangContext = createContext<LangContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("hi");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("bjym_locale") as Locale | null) : null;
    if (saved === "hi" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("bjym_locale", l);
      document.cookie = `bjym_locale=${l}; path=/; max-age=31536000`;
    }
  };

  return (
    <LangContext.Provider value={{ locale, setLocale, d: dictionary[locale] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
