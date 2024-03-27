/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bordercolor: "rgba(255, 255, 255, 0.20)",
        logos: "rgba(255, 255, 255, 0.6)",
        background: "rgba(18, 21, 23, 1,0.5)",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
