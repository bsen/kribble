import { CommunitySuggestions } from "../components/Communities/CommunitySuggestions";
import CreatePostComponent from "../components/ProfileComponents/CreatePostComponent";
import { Sidebar } from "../components/SideBar/Sidebar";
export const CreatePost = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <CreatePostComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <CommunitySuggestions />
      </div>
    </div>
  );
};
