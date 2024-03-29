import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
export const Quote = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black px-[10vw] lg:px-[5vw]">
      <div className="grid">
        <div className="w-full flex items-center">
          <div className="text-white text-[5rem] font-ubuntu">kribble</div>
        </div>
        <div>
          <div className=" text-neutral-100 text-3xl font-light font-ubuntu ">
            Tired of generic feeds? 🤔
          </div>
          <div className=" text-neutral-300 text-xl font-light my-5">
            Join the exclusive social media platform built just for VIT
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
