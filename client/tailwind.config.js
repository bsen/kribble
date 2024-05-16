/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgmain: "rgb(13 13 13);",
        bgtwo: "rgb(23 23 23);",
        textmain: "rgb(255 255 255);",
        texttwo: "rgb(163 163 163);",
        rosemain: "rgb(225 29 72);",
        indigomain: "rgb(79 70 229);",
        bordermain: "rgb(42 42 42);",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
