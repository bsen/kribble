import { Suggestions } from "../components/Communities/Suggestions";
import { UserCommunitiesComponent } from "../components/ProfileComponents/UserCommunitiesComponent";
import { SideBar } from "../components/SideBar/SideBar";
export const UserCommunities = () => {
  return (
    <div className="flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[45%]">
        <UserCommunitiesComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
