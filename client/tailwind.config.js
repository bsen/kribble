/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgmain: "rgb(250 250 250);",
        bgtwo: "rgb(238 242 255);",
        bgpost: "rgb(255 255 255);",
        textmain: "rgb(13 13 13);",
        texttwo: "rgb(82 82 82);",
        rosemain: "rgb(245, 66, 108);",
        icon: "rgb(245 245 245);",
        indigomain: "rgb(99 102 241);",
        bordermain: "rgb(245 245 245);",
      },
      fontFamily: {
        ubuntu: ["ubuntu", "ubuntu"],
      },
    },
  },

  plugins: [],
};
