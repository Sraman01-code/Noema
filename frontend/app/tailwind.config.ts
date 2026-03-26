import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Orbitron", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#111114",
          elevated: "#18181c",
          hover: "#1e1e24",
        },
        accent: {
          DEFAULT: "#8b5cf6",
          text: "#a78bfa",
          muted: "rgba(139, 92, 246, 0.15)",
        },
        border: {
          DEFAULT: "#1e1e24",
          subtle: "#16161a",
          active: "rgba(139, 92, 246, 0.45)",
        },
      },
    }
  },
  plugins: []
};

export default config;
