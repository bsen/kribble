import { SideBar } from "../../../components/Bars/SideBar";
import { CommentsComponent } from "../../../components/User/Comments/CommentsComponent";
export const Comments = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <CommentsComponent />
      </div>
      <div className="w-[22%] max-lg:hidden"></div>
    </div>
  );
};
