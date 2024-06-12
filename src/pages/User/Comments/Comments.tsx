import { SideBar } from "../../../components/Bars/SideBar";
import { CommentsComponent } from "../../../components/User/Comments/CommentsComponent";
export const Comments = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[32%]">
        <CommentsComponent />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
