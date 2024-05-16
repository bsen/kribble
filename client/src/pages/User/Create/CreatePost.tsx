import { SideBar } from "../../../components/Bars/SideBar";
import { Post } from "../../../components/User/Create/Post";

export const CreatePost = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[50%]">
        <Post />
      </div>
      <div className="w-[22%] max-lg:hidden"></div>
    </div>
  );
};
