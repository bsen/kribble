import { Sidebar } from "../components/Sidebar";
import { Profilepage } from "../components/Profilepage";
import { Suggetions } from "../components/Suggetions";

export const Profile = () => {
  return (
    <div className="flex justify-between bg-gray-50">
      <Sidebar />
      <div className="h-screen w-[50vw] overflow-y-auto no-scrollbar bg-white">
        <div>
          <Profilepage />
        </div>
      </div>
      <Suggetions />
    </div>
  );
};
