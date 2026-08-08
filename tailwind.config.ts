import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // rgb(var(...) / <alpha-value>) lets Tailwind substitute the opacity
        // modifier (bg-mitram-gold/20 etc.) — a bare var(--x) can't do that.
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        mitram: {
          white: "rgb(var(--color-white) / <alpha-value>)",
          gold: "rgb(var(--color-gold) / <alpha-value>)", // Aprox. logo
          goldDark: "rgb(var(--color-gold-dark) / <alpha-value>)", // Hover dos botões dourados
          goldLight: "rgb(var(--color-gold-light) / <alpha-value>)",
          goldText: "rgb(var(--color-gold-text) / <alpha-value>)", // Dourado com contraste p/ texto sobre fundo claro
          dark: "rgb(var(--color-dark) / <alpha-value>)",
          grayLight: "rgb(var(--color-gray-light) / <alpha-value>)",
          grayDark: "rgb(var(--color-gray-dark) / <alpha-value>)",
          whatsapp: "rgb(var(--color-whatsapp) / <alpha-value>)",
          whatsappDark: "rgb(var(--color-whatsapp-dark) / <alpha-value>)",
          // Cores semânticas de estado, derivadas da paleta padrão do Tailwind
          // para não duplicar valores hexadecimais já centralizados por ele.
          success: colors.green[600],
          successLight: colors.green[50],
          error: colors.red[600],
          errorLight: colors.red[50],
          warning: colors.yellow[700],
          warningLight: colors.yellow[50],
          info: colors.blue[600],
          infoLight: colors.blue[50],
        }
      },
    },
  },
  plugins: [],
};
export default config;
