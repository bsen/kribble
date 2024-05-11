import { SideBarComponent } from "../components/SideBar/SideBarComponent";
import { CommunityPost } from "../components/CreatePost/CommunityPost";

export const CreateCommunityPost = () => {
  return (
    <div className="flex justify-between bg-neutral-50">
      <div className="w-[20%] max-lg:hidden">
        <SideBarComponent />
      </div>
      <div className="w-full lg:w-[50%]">
        <CommunityPost />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
