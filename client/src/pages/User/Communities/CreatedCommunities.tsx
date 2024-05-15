import { SideBar } from "../../../components/Bars/SideBar";
import { CreatedCommunitiesComponent } from "../../../components/User/Communities/CreatedCommunitiesComponent";

export const CreatedCommunities = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full border-l border-r border-bordermain lg:w-[35%]">
        <CreatedCommunitiesComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
