import { Sidebar } from "../components/Sidebar";
import { Profilepage } from "../components/Profilepage";
import { Suggetions } from "../components/Suggetions";

export const Profile = () => {
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />
      <div className="h-screen w-[80%] border-l border-r border-gray-700 overflow-y-auto no-scrollbar">
        <Profilepage />
      </div>
      <Suggetions />
    </div>
  );
};
