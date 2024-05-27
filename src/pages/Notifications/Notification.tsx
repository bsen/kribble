import { SideBar } from "../../components/Bars/SideBar";
import { NotificationsComponent } from "../../components/Notifications/NotificationsComponent";

export const Notifications = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <NotificationsComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
