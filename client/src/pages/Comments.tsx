import { SideBar } from "../components/SideBar/SideBar";
import { Suggestions } from "../components/Communities/Suggestions";
import { CommentsComponent } from "../components/ProfileComponents/CommentsComponent";
export const Comments = () => {
  return (
    <div className="lg:flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[45%]">
        <CommentsComponent />
      </div>
      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
