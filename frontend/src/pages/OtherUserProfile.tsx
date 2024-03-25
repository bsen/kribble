import { Sidebar } from "../components/Sidebar";
import { VitDates } from "../components/VitDates";

import { OtherUsersProfilePage } from "../components/OtherUsersProfilePage";
export const OtherUserProfile = () => {
  return (
    <div className="flex  bg-neutral-950 justify-between">
      <div className="w-[25%]">
        <Sidebar />
      </div>
      <div className="w-[40%]">
        <OtherUsersProfilePage />
      </div>

      <div className="w-[25%]">
        <VitDates />
      </div>
    </div>
  );
};
