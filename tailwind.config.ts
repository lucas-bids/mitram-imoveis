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
        background: "var(--background)",
        foreground: "var(--foreground)",
        mitram: {
          white: "#ffffff",
          gold: "#D4AF37", // Aprox. logo
          goldLight: "#F0E68C",
          dark: "#1A1A1A",
          grayLight: "#F5F5F5",
          grayDark: "#333333",
        }
      },
    },
  },
  plugins: [],
};
export default config;
