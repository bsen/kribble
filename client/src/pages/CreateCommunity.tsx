import { SideBar } from "../components/SideBar/SideBar";
import { CreateCommunityComponent } from "../components/Communities/CreateCommunityComponent";
import { Suggestions } from "../components/Communities/Suggestions";

export const CreateCommunity = () => {
  return (
    <div className="flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[45%] h-screen overflow-y-auto no-scrollbar">
        <CreateCommunityComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
