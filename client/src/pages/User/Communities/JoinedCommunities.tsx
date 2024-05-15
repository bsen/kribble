import { SideBar } from "../../../components/Bars/SideBar";
import { JoinedCommunitiesComponent } from "../../../components/User/Communities/JoinedCommunitiesComponent";
export const JoinedCommunities = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full border-l border-r border-bordermain lg:w-[35%]">
        <JoinedCommunitiesComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
