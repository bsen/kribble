import { SideBar } from "../../../components/Bars/SideBar";
import { CommunitiesComponent } from "../../../components/Community/Communities/CommunitesComponent";

export const Communities = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <CommunitiesComponent />
      </div>
      <div className="w-[22%] max-lg:hidden "></div>
    </div>
  );
};
