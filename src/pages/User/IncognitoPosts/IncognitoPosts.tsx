import { SideBar } from "../../../components/Bars/SideBar";
import { IncognitoPostsComponent } from "../../../components/User/IncognitoPosts/IncognitoPostsComponent";
export const IncognitoPosts = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <IncognitoPostsComponent />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
