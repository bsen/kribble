import { SideBar } from "../../components/Bars/SideBar";
import { PostProfile } from "../../components/Post/PostProfile";

export const Post = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[32%]">
        <PostProfile />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
