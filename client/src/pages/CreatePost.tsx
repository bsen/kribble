import { Suggestions } from "../components/Communities/Suggestions";
import { CreatePostComponent } from "../components/Post/CreatePostComponent";
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
        <Suggestions />
      </div>
    </div>
  );
};
