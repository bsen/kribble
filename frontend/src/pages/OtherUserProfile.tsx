import { Sidebar } from "../components/Sidebar";
import { VitDates } from "../components/VitDates";

import { OtherUsersProfilePage } from "../components/OtherUsersProfilePage";
export const OtherUserProfile = () => {
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />
      <div className="h-screen w-[80%] border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
        <OtherUsersProfilePage />
      </div>
      <VitDates />
    </div>
  );
};
