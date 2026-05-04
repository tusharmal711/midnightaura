/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B0F1A",
        surface: "#0E1320",
        card: "#141928",
        neon: "#ff00ff",
        accent: "#9333ea",
        brand: {
          purple: "#7c3aed",
          pink: "#c026d3",
          orange: "#ea580c",
          yellow: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-purple": "0 0 20px rgba(124, 58, 237, 0.4)",
        "neon-pink": "0 0 20px rgba(192, 38, 211, 0.4)",
      },
    },
  },
  plugins: [],
};