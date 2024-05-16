import { SideBar } from "../../../components/Bars/SideBar";
import { UpdateProfileComponent } from "../../../components/User/Update/UpdateComponent";

export const UpdateProfile = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[50%]">
        <UpdateProfileComponent />
      </div>
      <div className="w-[22%] max-lg:hidden"></div>
    </div>
  );
};
