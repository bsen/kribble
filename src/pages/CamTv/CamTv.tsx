import { SideBar } from "../../components/Bars/SideBar";
import { CamTvComponent } from "../../components/Camv/CamTvComponent";
export const CamTv = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <CamTvComponent />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
