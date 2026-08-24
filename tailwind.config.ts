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
        mint: {
          50: "#F2FBF9",
          100: "#DFF6F0",
          200: "#B6EFE5",
          300: "#8EE7D9",
          400: "#6DD5C4",
          500: "#3BB2A1",
          600: "#268D7F",
          700: "#1C6C62",
          800: "#16534B",
          900: "#113E38",
        },
        eucalyptus: {
          50: "#FAF8F4",
          100: "#F4EFE6",
          200: "#E4DDD0",
          300: "#C7D7C3",
          400: "#A7C4A0",
          500: "#81A87B",
          600: "#62875D",
          700: "#4B6847",
          800: "#3B5138",
          900: "#2D3D2B",
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
        display: ["var(--font-luxury-display)", "Cormorant Garamond", "Georgia", "serif"],
        eyebrow: ["var(--font-luxury-eyebrow)", "Marcellus", "Trajan Pro", "serif"],
        body: ["var(--font-luxury-body)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-luxury-mono)", "Space Grotesk", "monospace"],
      },
      letterSpacing: {
        'lux-tight': '-0.025em',
        'lux-snug': '-0.015em',
        'lux-normal': '0.01em',
        'lux-wide': '0.12em',
        'lux-wider': '0.20em',
        'lux-widest': '0.28em',
      },
      lineHeight: {
        'lux-display': '1.05',
        'lux-heading': '1.15',
        'lux-body': '1.70',
        'lux-relaxed': '1.85',
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 20px -4px rgba(44, 50, 40, 0.08), 0 1px 3px rgba(44, 50, 40, 0.04)",
        lifted: "0 8px 40px -8px rgba(44, 50, 40, 0.12), 0 2px 8px rgba(44, 50, 40, 0.06)",
        glow: "0 0 40px rgba(109, 213, 196, 0.25)",
        eucalyptus: "0 0 35px rgba(167, 196, 160, 0.3)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "float": "float 4s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s linear infinite",
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
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
