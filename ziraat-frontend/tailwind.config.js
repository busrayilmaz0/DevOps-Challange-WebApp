/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ziraatRed: '#a6192e', // Ziraat'in o ikonik bordo/kırmızı rengi
      },
    },
  },
  plugins: [],
}