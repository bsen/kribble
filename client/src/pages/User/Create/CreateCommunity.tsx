import { SideBar } from "../../../components/Bars/SideBar";
import { Community } from "../../../components/User/Create/Community";

export const CreateCommunity = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <Community />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
