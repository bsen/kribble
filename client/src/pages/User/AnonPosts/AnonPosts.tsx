import { SideBar } from "../../../components/Bars/SideBar";
import { AnonPostsComponent } from "../../../components/User/AnonPosts/AnonPostsComponent";

export const AnonPosts = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <AnonPostsComponent />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
