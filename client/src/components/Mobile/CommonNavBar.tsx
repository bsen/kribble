import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

export const CommonNavBar = () => {
  return (
    <>
      <div className="top-0 h-14 shadow-sm  bg-white/95 fixed w-full lg:w-[50%]">
        <div className="h-full w-full flex justify-start items-center px-4">
          <button
            onClick={() => {
              history.go(-1);
            }}
          >
            <ArrowBackIosNewRoundedIcon
              className="text-neutral-600 rounded-full py-1"
              sx={{ fontSize: 40 }}
            />
          </button>
        </div>
      </div>
    </>
  );
};
