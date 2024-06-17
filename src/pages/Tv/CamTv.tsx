import { SideBar } from "../../components/Bars/SideBar";
import { TvComponent } from "../../components/Tv/TvComponent";
export const Tv = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <TvComponent />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
