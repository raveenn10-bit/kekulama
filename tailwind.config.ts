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
          50: "#f7f8f5",
          100: "#e9ede4",
          200: "#d5dcca",
          300: "#b5c0a8",
          400: "#95a385",
          500: "#78886a",
          600: "#5e6d53",
          700: "#4b5743",
          800: "#3d4637",
          900: "#2d3329",
          950: "#1d231a",
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
        "2xl": "1rem",     // 16px
        "3xl": "1.5rem",   // 24px
        "4xl": "2rem",     // 32px
      },
      boxShadow: {
        soft: "0 2px 20px -2px rgba(30, 46, 36, 0.05), 0 1px 4px -1px rgba(30, 46, 36, 0.03)",
        lifted: "0 14px 40px -8px rgba(30, 46, 36, 0.09), 0 4px 12px -2px rgba(30, 46, 36, 0.04)",
        glow: "0 8px 32px -4px rgba(109, 213, 196, 0.22)",
        eucalyptus: "0 8px 30px -4px rgba(167, 196, 160, 0.24)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "float": "float 4s ease-in-out infinite",
        "pulse-slow": "pulse 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
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
