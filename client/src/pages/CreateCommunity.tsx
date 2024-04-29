import { Sidebar } from "../components/SideBar/Sidebar";
import { CreateCommunityComponent } from "../components/Communities/CreateCommunityComponent";
import { Suggestions } from "../components/Communities/Suggestions";

export const CreateCommunity = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%] h-screen max-lg:my-14 overflow-y-auto no-scrollbar">
        <CreateCommunityComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
