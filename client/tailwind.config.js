/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "rgb(18 18 18);",
        semidark: "rgb(30 30 30);",
        light: "rgb(220 220 220);",
        semilight: "rgb(200 200 200);",
        rosemain: "rgb(232, 32, 62);",
        indigomain: "rgb(79 70 229);",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
