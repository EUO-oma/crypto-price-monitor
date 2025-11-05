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
        primary: "#2196f3",
        secondary: "#4caf50",
        danger: "#f44336",
        warning: "#ff9800",
        "dark-bg": "#121212",
        "card-bg": "#1e1e1e",
        "hover-bg": "#2a2a2a",
        "border-color": "#333",
        "text-primary": "#ffffff",
        "text-secondary": "#b0b0b0",
      },
    },
  },
  plugins: [],
};

export default config;