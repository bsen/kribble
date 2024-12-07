/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "rgb(8, 12, 16)",
        semidark: "rgb(23, 25, 31)",
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
};
