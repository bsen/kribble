import { SideBar } from "../../../components/Bars/SideBar";
import { CommunitiesComponent } from "../../../components/Community/Communities/CommunitesComponent";

export const Communities = () => {
  return (
    <div
      className="flex justify-evenly 
"
    >
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div
        className="w-full lg:w-[32%] 
"
      >
        <CommunitiesComponent />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
