import { PostComponent } from "../components/Post/PostComponent";
import { Sidebar } from "../components/SideBar/Sidebar";
import { Suggestions } from "../components/Communities/Suggestions";
export const Post = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
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
