import { SideBar } from "../../../components/Bars/SideBar";
import { FollowersComponent } from "../../../components/User/Follow/FollowersComponent";

export const Followers = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <FollowersComponent />
      </div>
      <div className="w-[22%] max-lg:hidden"></div>
    </div>
  );
};
