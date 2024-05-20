import { SideBar } from "../../../components/Bars/SideBar";
import { InBoxComponent } from "../../../components/User/InBox/InBoxComponent";

export const Inbox = () => {
  return (
    <div
      className="flex justify-evenly 
"
    >
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div
        className="w-full lg:w-[40%] 
"
      >
        <InBoxComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
