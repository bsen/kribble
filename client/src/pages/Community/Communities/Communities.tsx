import { SideBar } from "../../../components/Bars/SideBar";
import { CommunitiesComponent } from "../../../components/Community/Communities/CommunitesComponent";

export const Communities = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <CommunitiesComponent />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
