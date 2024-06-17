import { NavBar } from "../Bars/NavBar";
import { BottomBar } from "../Bars/BottomBar";

export const TvComponent = () => {
  return (
    <>
      <div className="overflow-y-auto no-scrollbar py-12">
        <NavBar />
        <div className="w-full rounded-lg mt-2 p-3 bg-dark flex justify-center items-center">
          <div>
            <img src="/tv.png" className="h-40" />
            <div className="text-center text-light mt-2 text-lg font-ubuntu">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
      <BottomBar />
    </>
  );
};
