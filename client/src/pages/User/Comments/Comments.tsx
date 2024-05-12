import { SideBar } from "../../../components/Bars/SideBar";
import { CommentsComponent } from "../../../components/User/Comments/CommentsComponent";
export const Comments = () => {
  return (
    <div className="flex justify-between bg-neutral-50">
      <div className="w-[20%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[50%]">
        <CommentsComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
