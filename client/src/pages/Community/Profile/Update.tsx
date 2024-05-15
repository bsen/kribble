import { UpdateCommunityComponent } from "../../../components/Community/Update/UpdateComponent";
import { SideBar } from "../../../components/Bars/SideBar";

export const UpdateCommunity = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <UpdateCommunityComponent />
      </div>
      <div className="w-[22%] max-lg:hidden"></div>
    </div>
  );
};
