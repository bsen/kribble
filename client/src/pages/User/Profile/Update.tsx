import { SideBar } from "../../../components/Bars/SideBar";
import { UpdateProfileComponent } from "../../../components/User/Update/UpdateComponent";

export const UpdateProfile = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <UpdateProfileComponent />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
