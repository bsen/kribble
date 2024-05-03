import { CreateCommunityPostComponent } from "../components/Communities/CreateCommunityPostComponent";
import { Suggestions } from "../components/Communities/Suggestions";
import { Sidebar } from "../components/SideBar/Sidebar";
export const CreateCommunityPost = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <CreateCommunityPostComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};