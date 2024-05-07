import { SideBarComponent } from "../components/SideBar/SideBarComponent";
import { Suggestions } from "../components/Communities/Suggestions";
import { CreatePostComponent } from "../components/Post/CreatePostComponent";
export const CreatePost = () => {
  return (
    <div className="flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBarComponent />
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
