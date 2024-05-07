import { SideBarComponent } from "../components/SideBar/SideBarComponent";
import { CommunitiesComponent } from "../components/Communities/CommunitesComponent";
import { Suggestions } from "../components/Communities/Suggestions";

export const Communities = () => {
  return (
    <div className="flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBarComponent />
      </div>
      <div className="w-full lg:w-[45%]">
        <CommunitiesComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
