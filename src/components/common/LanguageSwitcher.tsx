"use client";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useLang();
  return (
    <div className={cn("inline-flex rounded-full border p-0.5 text-xs font-bold", dark ? "border-white/20 bg-white/10" : "border-border bg-white")}>
      {(["hi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-full px-3 py-1.5 transition-colors",
            locale === l ? "bg-primary text-white" : dark ? "text-white/70" : "text-muted"
          )}
        >
          {l === "hi" ? "हिं" : "EN"}
        </button>
      ))}
    </div>
  );
}
