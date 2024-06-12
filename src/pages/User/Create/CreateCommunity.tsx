import { SideBar } from "../../../components/Bars/SideBar";
import { Community } from "../../../components/User/Create/Community";

export const CreateCommunity = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[32%]">
        <Community />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
