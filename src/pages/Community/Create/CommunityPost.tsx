import { SideBar } from "../../../components/Bars/SideBar";
import { Post } from "../../../components/Community/Create/Post";

export const CommunityPost = () => {
  return (
    <div
      className="flex justify-evenly 
"
    >
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div
        className="w-full lg:w-[40%] 
"
      >
        <Post />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
