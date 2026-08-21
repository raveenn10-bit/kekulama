import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f6f7f4",
          100: "#e8ebe3",
          200: "#d3d9ca",
          300: "#b3bda6",
          400: "#93a182",
          500: "#768668",
          600: "#5d6b52",
          700: "#4a5542",
          800: "#3d4537",
          900: "#2c3228",
          950: "#1e2420",
        },
        sand: {
          50: "#faf8f5",
          100: "#f3efe8",
          200: "#e6ddd0",
          300: "#d5c7b2",
          400: "#c0a98e",
          500: "#b08f72",
          600: "#a37d63",
          700: "#886753",
          800: "#6f5547",
          900: "#5b463c",
        },
        bark: {
          DEFAULT: "#b8956a",
          light: "#d4b896",
          dark: "#8a6d4a",
        },
        forest: {
          DEFAULT: "#2c3e2d",
          light: "#3d5340",
          dark: "#1e2e24",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 20px -4px rgba(44, 50, 40, 0.08), 0 1px 3px rgba(44, 50, 40, 0.04)",
        lifted: "0 8px 40px -8px rgba(44, 50, 40, 0.12), 0 2px 8px rgba(44, 50, 40, 0.06)",
        glow: "0 0 40px rgba(184, 149, 106, 0.15)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
