"use client";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useLang();
  const isEn = locale === "en";

  return (
    <div
      className={cn(
        "relative inline-flex h-9 w-[112px] shrink-0 items-center rounded-full border p-0.5 text-[11px] font-black",
        dark ? "border-white/20 bg-white/10" : "border-border bg-bg"
      )}
      role="group"
      aria-label="Language selector"
    >
      {/* sliding indicator */}
      <span
        className="absolute top-0.5 h-8 w-[54px] rounded-full bg-gradient-to-br from-orange-400 to-primary-dark shadow-sm transition-transform duration-200 ease-out"
        style={{ transform: isEn ? "translateX(54px)" : "translateX(0px)" }}
        aria-hidden
      />
      <button
        onClick={() => setLocale("hi")}
        className={cn("relative z-10 flex-1 rounded-full py-1.5 text-center transition-colors", !isEn ? "text-white" : dark ? "text-white/70" : "text-muted")}
        aria-pressed={!isEn}
      >
        हिन्दी
      </button>
      <button
        onClick={() => setLocale("en")}
        className={cn("relative z-10 flex-1 rounded-full py-1.5 text-center transition-colors", isEn ? "text-white" : dark ? "text-white/70" : "text-muted")}
        aria-pressed={isEn}
      >
        EN
      </button>
    </div>
  );
}
