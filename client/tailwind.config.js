/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgmain: "rgb(20 20 20);",
        bgtwo: "rgb(40 40 40);",
        textmain: "rgb(240 240 240);",
        texttwo: "rgb(210 210 210);",
        rosemain: "rgb(245, 66, 108);",
        indigomain: "rgb(79 70 229);",
        bordermain: "rgb(40 40 40);",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
