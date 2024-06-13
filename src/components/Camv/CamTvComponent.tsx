import { NavBar } from "../Bars/NavBar";
import { BottomBar } from "../Bars/BottomBar";

export const CamTvComponent = () => {
  return (
    <>
      <NavBar />
      <div className="my-3 p-4 text-light flex flex-col items-center rounded-lg shadow-md">
        <img src="/tv.png" className="w-44" />
        <div className="flex items-center gap-2 my-4">
          <h2 className="text-xl font-light">CamTv, Coming Soon!</h2>
        </div>
      </div>
      <BottomBar />
    </>
  );
};
