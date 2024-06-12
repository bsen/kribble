import { SideBar } from "../../../components/Bars/SideBar";
import { UpdateProfileComponent } from "../../../components/User/Update/UpdateComponent";

export const UpdateProfile = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[32%]">
        <UpdateProfileComponent />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
