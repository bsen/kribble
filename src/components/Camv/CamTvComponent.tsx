import LiveTvIcon from "@mui/icons-material/LiveTv";
import { NavBar } from "../Bars/NavBar";
import { BottomBar } from "../Bars/BottomBar";

export const CamTvComponent = () => {
  return (
    <>
      <NavBar />
      <div className="my-3 p-4 text-light flex flex-col items-center rounded-lg shadow-md">
        <img src="/tv.png" className="w-44" />
        <div className="flex items-center gap-2 my-4">
          <LiveTvIcon className="text-indigo-600" />
          <h2 className="text-lg font-semibold">CamTv, Coming Soon!</h2>
        </div>
      </div>
      <BottomBar />
    </>
  );
};
