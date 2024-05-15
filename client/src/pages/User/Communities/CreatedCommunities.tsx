import { SideBar } from "../../../components/Bars/SideBar";
import { CreatedCommunitiesComponent } from "../../../components/User/Communities/CreatedCommunitiesComponent";

export const CreatedCommunities = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <CreatedCommunitiesComponent />
      </div>
      <div className="w-[22%] max-lg:hidden"></div>
    </div>
  );
};
