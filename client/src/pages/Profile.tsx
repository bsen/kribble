import { Sidebar } from "../components/Sidebar";
import { MatchMakerPage } from "../components/MatchMaker/MatchMakerPage";
import { PostsUser } from "../components/ProfileComponents/PostsUser";
export const Profile = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <PostsUser />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <MatchMakerPage />
      </div>
    </div>
  );
};
