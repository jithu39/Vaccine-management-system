/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        textColor: "#FFFFFF",
        primary: "#000000",
        cta: "#56D7CE",
      },
    },
  },
  plugins: [],
}