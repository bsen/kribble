import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
export const Quote = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center px-[10vw] lg:px-[5vw]">
      <div className="absolute w-1/2 h-[20%] lg:w-[20%] bg-orange-300 rounded-t top-0 left-0 rounded-full"></div>
      <div className="absolute w-1/2 h-[20%] lg:w-[20%] bg-indigo-300 rounded-b bottom-0 rounded-full"></div>
      <div className="absolute h-24 w-24 right-1/2 max-lg:hidden bg-lime-300  rounded-full"></div>

      <div className="grid">
        <div className="w-full flex items-center">
          <div className="text-black text-[5rem] font-ubuntu">Kribble</div>
        </div>
        <div>
          <div className=" text-black text-3xl font-light font-ubuntu ">
            Tired of generic feeds? 🤔
          </div>
          <div className=" text-black text-xl font-light my-5">
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
              className="text-black border my-5 border-neutral-600 rounded-full"
              sx={{ fontSize: 50 }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
