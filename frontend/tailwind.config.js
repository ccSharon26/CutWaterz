/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", 
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#b8860b", 
        darkBg: "#121212",
        lightBg: "#f5f5f5",
      },
    },
  },
  plugins: [],
}
