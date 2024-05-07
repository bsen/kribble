import { SideBarComponent } from "../components/SideBar/SideBarComponent";
import { PostComponent } from "../components/Post/PostComponent";
import { Suggestions } from "../components/Communities/Suggestions";
export const Post = () => {
  return (
    <div className="flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBarComponent />
      </div>
      <div className="w-full lg:w-[45%] h-screen overflow-y-auto no-scrollbar">
        <PostComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
