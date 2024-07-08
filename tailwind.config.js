/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "rgb(15 15 15);",
        semidark: "rgb(40 40 40);",
        light: "rgb(220 220 220);",
        semilight: "rgb(200 200 200);",
        rosemain: "rgb(210, 60, 60);",
        indigomain: "rgb(79 70 229);",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
