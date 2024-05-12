import { SideBar } from "../../components/Bars/SideBar";
import { PostProfile } from "../../components/Post/PostProfile";

export const Post = () => {
  return (
    <div className="flex justify-between bg-neutral-50">
      <div className="w-[20%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[50%]">
        <PostProfile />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
