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
        background: "var(--background)",
        foreground: "var(--foreground)",
        mitram: {
          white: "var(--color-white)",
          gold: "var(--color-gold)", // Aprox. logo
          goldDark: "var(--color-gold-dark)", // Hover dos botões dourados
          goldLight: "var(--color-gold-light)",
          goldText: "var(--color-gold-text)", // Dourado com contraste p/ texto sobre fundo claro
          dark: "var(--color-dark)",
          grayLight: "var(--color-gray-light)",
          grayDark: "var(--color-gray-dark)",
          whatsapp: "var(--color-whatsapp)",
          whatsappDark: "var(--color-whatsapp-dark)",
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
