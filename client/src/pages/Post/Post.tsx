import { SideBar } from "../../components/Bars/SideBar";
import { PostProfile } from "../../components/Post/PostProfile";

export const Post = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <PostProfile />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
