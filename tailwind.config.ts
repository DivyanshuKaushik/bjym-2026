import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#F36B21", dark: "#D85A0B", light: "#FFF4EC" },
        secondary: { DEFAULT: "#1F6B3B", dark: "#14532D", light: "#EAF7EF" },
        navy: "#161A8D",
        bg: "#FAF8F4",
        surface: "#FFFFFF",
        border: "#E8E2D9",
        heading: "#1F2937",
        muted: "#6B7280",
        success: "#16A34A",
        danger: "#DC2626",
        warning: "#F59E0B",
      },
      borderRadius: { xl: "14px", "2xl": "18px" },
      fontFamily: {
        devanagari: ["'Noto Sans Devanagari'", "system-ui", "sans-serif"],
        serif: ["Georgia", "'Noto Serif Devanagari'", "serif"],
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0) rotate(-3deg)" }, "50%": { transform: "translateY(-14px) rotate(-1.5deg)" } },
        glowPulse: { "0%,100%": { opacity: "0.55" }, "50%": { opacity: "0.9" } },
        holo: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(22px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        floaty: "floaty 6.5s ease-in-out infinite",
        glowPulse: "glowPulse 5.5s ease-in-out infinite",
        holo: "holo 5s linear infinite",
        fadeUp: "fadeUp .7s cubic-bezier(.22,.9,.3,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
