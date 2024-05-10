import { SideBarComponent } from "../components/SideBar/SideBarComponent";
import { CommunityPostCreate } from "../components/Post/CommunityPostCreate";
import { Suggestions } from "../components/Communities/Suggestions";

export const CreateCommunityPost = () => {
  return (
    <div className="flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBarComponent />
      </div>
      <div className="w-full lg:w-[45%]">
        <CommunityPostCreate />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
