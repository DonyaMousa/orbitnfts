/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc6fb",
          400: "#36a9f7",
          500: "#0c8ee7",
          600: "#0070c4",
          700: "#0059a0",
          800: "#064b84",
          900: "#0a406e",
          950: "#07294a",
        },
        secondary: {
          50: "#f4f2ff",
          100: "#ebe7fe",
          200: "#d9d2fe",
          300: "#beb0fd",
          400: "#9f85fa",
          500: "#8257f5",
          600: "#7039ea",
          700: "#5f28d0",
          800: "#4e22ab",
          900: "#421e8c",
          950: "#271160",
        },
        accent: {
          50: "#fef2ff",
          100: "#fde6ff",
          200: "#fbccff",
          300: "#f9a3ff",
          400: "#f56aff",
          500: "#e935f9",
          600: "#cc17d9",
          700: "#a911b0",
          800: "#8c1290",
          900: "#731376",
          950: "#4a0050",
        },
        dark: {
          100: "#1a1a2e",
          200: "#16213e",
          300: "#0f3460",
          400: "#0a1128",
        },
      },
      fontFamily: {
        sans: ["FirstFont", "Inter", "sans-serif"],
        display: ["FirstFont", "Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        first: ["FirstFont", "sans-serif"],
        heading: ["FirstFont", "sans-serif"],
      },
      boxShadow: {
        "neon-primary":
          "0 0 5px theme(colors.primary.400), 0 0 20px theme(colors.primary.500/50)",
        "neon-secondary":
          "0 0 5px theme(colors.secondary.400), 0 0 20px theme(colors.secondary.500/50)",
        "neon-accent":
          "0 0 5px theme(colors.accent.400), 0 0 20px theme(colors.accent.500/50)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": {
            boxShadow:
              "0 0 5px rgba(79, 70, 229, 0.2), 0 0 20px rgba(79, 70, 229, 0.2)",
          },
          "100%": {
            boxShadow:
              "0 0 10px rgba(79, 70, 229, 0.6), 0 0 30px rgba(79, 70, 229, 0.4)",
          },
        },
        shimmer: {
          "0%": { transform: "translateX(-200%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
    },
  },
  plugins: [],
};
