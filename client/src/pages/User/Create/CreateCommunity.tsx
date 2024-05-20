import { SideBar } from "../../../components/Bars/SideBar";
import { Community } from "../../../components/User/Create/Community";

export const CreateCommunity = () => {
  return (
    <div className="flex justify-evenly bg-bgblack">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%] bg-bgblack">
        <Community />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
