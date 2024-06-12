/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "rgb(15 15 15);",
        semidark: "rgb(25 25 25);",
        light: "rgb(220 220 220);",
        semilight: "rgb(200 200 200);",
        rosemain: "rgb(200, 50, 50);",
        indigomain: "rgb(79 70 229);",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
