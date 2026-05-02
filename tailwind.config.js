/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1e3b8a",
        "primary-light": "#2563eb",
        "background-light": "#f6f6f8",
        "background-dark": "#121620",
      },
      fontFamily: { 
        "display": ["Inter", "sans-serif"] 
      },
      borderRadius: { 
        "DEFAULT": "0.25rem", 
        "lg": "0.5rem", 
        "xl": "0.75rem", 
        "full": "9999px" 
      },
    },
  },
  plugins: [],
}
