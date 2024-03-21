/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        grayBack: "rgb(18, 21, 23)",
        logos: "rgba(255, 255, 255, 0.6)",
      },
    },
  },

  plugins: [],
};
