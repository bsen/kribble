import { SideBar } from "../../../components/Bars/SideBar";
import { Post } from "../../../components/User/Create/Post";

export const CreatePost = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <Post />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
