import { PostPage } from "../components/Post/PostPage";
import { Sidebar } from "../components/SideBar/Sidebar";
import { CommunitySuggestions } from "../components/Communities/CommunitySuggestions";
export const Post = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%] h-screen max-lg:my-14 overflow-y-auto no-scrollbar">
        <PostPage />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <CommunitySuggestions />
      </div>
    </div>
  );
};
