import { SideBar } from "../../../components/Bars/SideBar";
import { FollowersComponent } from "../../../components/User/Follow/FollowersComponent";

export const Followers = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full border-l border-r border-bordermain lg:w-[35%]">
        <FollowersComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
