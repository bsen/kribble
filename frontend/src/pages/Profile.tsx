import { Sidebar } from "../components/Sidebar";
import { Profilepage } from "../components/Profilepage";
import { VitDates } from "../components/VitDates";

export const Profile = () => {
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />
      <div className="w-[80%]">
        <Profilepage />
      </div>

      <div className="w-[50%]">
        <VitDates />
      </div>
    </div>
  );
};
