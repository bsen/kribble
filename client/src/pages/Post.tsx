import { SideBarComponent } from "../components/SideBar/SideBarComponent";
import { PostComponent } from "../components/Post/PostComponent";

export const Post = () => {
  return (
    <div className="flex justify-between bg-neutral-50">
      <div className="w-[20%] max-lg:hidden">
        <SideBarComponent />
      </div>
      <div className="w-full lg:w-[50%]">
        <PostComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
