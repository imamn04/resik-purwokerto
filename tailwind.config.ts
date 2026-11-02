import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        // Horizon UI Palette
        horizon: {
          canvas: "#F4F7FE",
          card: "#FFFFFF",
          navy: {
            DEFAULT: "#111C44",
            dark: "#0B1437",
            light: "#1B254B",
            hover: "#1F2B5B",
          },
          gold: {
            DEFAULT: "#F59E0B",
            light: "#FEF3C7",
            hover: "#D97706",
            glow: "#FFAA00",
          },
          text: {
            main: "#1B254B",
            muted: "#707E94",
            light: "#A3AED0",
          },
        },
        // Resik Purwokerto Instagram Brand Palette
        resik: {
          navy: "#0F172A",
          blue: "#1E3A8A",
          gold: "#F59E0B",
          yellow: {
            DEFAULT: "#F59E0B",
            light: "#FEF3C7",
            hover: "#D97706",
            dark: "#B45309",
          },
          bg: "#F4F7FE",
        },
      },
      boxShadow: {
        horizon: "0px 18px 40px rgba(112, 144, 176, 0.12)",
        "horizon-sm": "0px 6px 20px rgba(112, 144, 176, 0.08)",
        "horizon-glow": "0px 10px 25px rgba(245, 158, 11, 0.35)",
        "horizon-navy": "0px 14px 30px rgba(17, 28, 68, 0.25)",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out forwards",
        "pulse-glow": "pulseGlow 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
