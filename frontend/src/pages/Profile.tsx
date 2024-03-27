import { Sidebar } from "../components/Sidebar";
import { Profilepage } from "../components/Profilepage";
import { Matches } from "../components/Matches";

export const Profile = () => {
  return (
    <div className="flex  bg-neutral-950 justify-between">
      <div className="w-[25%]">
        <Sidebar />
      </div>
      <div className="w-[40%]">
        <Profilepage />
      </div>

      <div className="w-[25%]">
        <Matches />
      </div>
    </div>
  );
};
