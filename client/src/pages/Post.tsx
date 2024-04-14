import { KribConnectPage } from "../components/KribConnect/KribConectPage";
import { PostPage } from "../components/PostPage";
import { Sidebar } from "../components/Sidebar";

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
        <KribConnectPage />
      </div>
    </div>
  );
};
