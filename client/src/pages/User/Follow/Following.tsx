import { SideBar } from "../../../components/Bars/SideBar";
import { FollowingComponent } from "../../../components/User/Follow/FollowingComponent";

export const Following = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full border-l border-r border-bordermain lg:w-[35%]">
        <FollowingComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
