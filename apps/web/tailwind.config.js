/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0a0a0a",
        panel: "#111111",
        border: "#1f1f1f",
        accent: "#e8ff47",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
