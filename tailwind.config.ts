import type { Config } from "tailwindcss";

// Paleta derivada do azul institucional do Inatel (#1E60AD).
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        inatel: {
          50: "#E8F0F9",
          100: "#C6DBF1",
          200: "#9CC0E6",
          300: "#6FA3D9",
          400: "#4581C4",
          500: "#1E60AD", // cor primária da marca
          600: "#1A5293",
          700: "#154379",
          800: "#10345E",
          900: "#0B2440",
          DEFAULT: "#1E60AD",
        },
      },
    },
  },
  plugins: [],
};

export default config;
