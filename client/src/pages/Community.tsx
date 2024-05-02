import { Sidebar } from "../components/SideBar/Sidebar";
import { Suggestions } from "../components/Communities/Suggestions";
import { CommunityProfile } from "../components/Communities/CommunityProfile";
export const Community = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <CommunityProfile />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
