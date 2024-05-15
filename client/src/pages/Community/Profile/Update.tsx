import { UpdateCommunityComponent } from "../../../components/Community/Update/UpdateComponent";
import { SideBar } from "../../../components/Bars/SideBar";

export const UpdateCommunity = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full border-l border-r border-bordermain lg:w-[35%]">
        <UpdateCommunityComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
