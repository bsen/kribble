import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
export const Quote = () => {
  return (
    <div className="h-screen bg-black w-full flex items-center justify-center px-[10vw] lg:px-[5vw]">
      <div className="grid">
        <div className="w-full flex items-center">
          <div className="bg-gradient-to-r text-[5rem] font-ubuntu from-indigo-500 via-purple-400 to-violet-500  text-transparent bg-clip-text">
            Kribble
          </div>
        </div>
        <div>
          <div className=" text-white text-xl font-light font-ubuntu">
            Join the exclusive social media platform built just for college
            students.
          </div>
        </div>

        <div className="lg:hidden text-left">
          <button
            onClick={() => {
              scroll(0, 1000);
            }}
          >
            <ArrowDownwardRoundedIcon
              className="text-white border my-5 border-neutral-600 rounded-full"
              sx={{ fontSize: 50 }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
