"use client";

import React, { createContext, useContext } from "react";
import { dictionary, type Locale } from "./dictionary";

/**
 * Multilingual support was removed per project requirements — the
 * entire application is Hindi-only now. This provider is kept as a thin
 * shim (rather than deleting it and touching every component that calls
 * `useLang()`) so `d.<key>` lookups throughout the codebase keep working
 * unchanged; `locale` is now permanently "hi" and there is no setter.
 * The visible language switcher UI has been removed from the Navbar.
 */
type LangContextType = {
  locale: Locale;
  d: (typeof dictionary)["hi"];
};

const LangContext = createContext<LangContextType>({ locale: "hi", d: dictionary.hi });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <LangContext.Provider value={{ locale: "hi", d: dictionary.hi }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
