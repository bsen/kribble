import { SideBarComponent } from "../components/SideBar/SideBarComponent";
import { FollowersComponent } from "../components/ProfileComponents/FollowersComponent";

export const Followers = () => {
  return (
    <div className="flex justify-between bg-neutral-50">
      <div className="w-[20%] max-lg:hidden">
        <SideBarComponent />
      </div>
      <div className="w-full lg:w-[50%]">
        <FollowersComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
