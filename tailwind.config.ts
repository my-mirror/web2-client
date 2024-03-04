/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: "#1d1d1b",
        primary: "#e40615",
      },
    },
  },
  plugins: [],
};
