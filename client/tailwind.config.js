/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgmain: "rgb(0 0 0);",
        bgtwo: "rgb(23 23 23);",
        textmain: "rgb(255 255 255);",
        texttwo: "rgb(163 163 163);",
        rosemain: "rgb(225 29 72);",
        indigomain: "rgb(79 70 229);",
        bordermain: "rgb(39 39 42);",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
