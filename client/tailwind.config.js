/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgmain: "rgb(18 18 18);",
        bgtwo: "rgb(40 40 40);",
        textmain: "rgb(220 220 220);",
        texttwo: "rgb(200 200 200);",
        rosemain: "rgb(232, 32, 62);",
        indigomain: "rgb(79 70 229);",
        bordermain: "rgb(30 30 30);",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
