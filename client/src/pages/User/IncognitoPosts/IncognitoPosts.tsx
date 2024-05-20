import { SideBar } from "../../../components/Bars/SideBar";
import { IncognitoPostsComponent } from "../../../components/User/IncognitoPosts/IncognitoPostsComponent";
export const IncognitoPosts = () => {
  return (
    <div className="flex justify-evenly bg-bgblack">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%] bg-bgblack">
        <IncognitoPostsComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
