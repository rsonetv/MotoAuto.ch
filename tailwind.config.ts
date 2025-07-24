import type { Config } from "tailwindcss";
import defaultConfig from "shadcn/ui/tailwind.config";

const config: Config = {
  ...defaultConfig,
  content: [
    ...defaultConfig.content,
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        /* Markowa paleta MotoAuto.ch */
        brand: {
          DEFAULT: "#009fb7",   // primary
          light:  "#00cfe8",    // hover / gradient
          dark:   "#007c91",    // ciemniejszy odcień
        },
        neutral: {
          50:  "#f7f9fc",       // background
          100: "#e9eef5",       // secondary bg
          900: "#0a0a0a",       // tekst
        },
        danger: {
          DEFAULT: "#e60023",   // czerwony akcent ".ch"
        },
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",     opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
};

export default config;
