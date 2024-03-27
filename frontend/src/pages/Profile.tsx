import { Sidebar } from "../components/Sidebar";
import { Profilepage } from "../components/Profilepage";
import { MatchMaker } from "../components/MatchMaker";

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
        <MatchMaker />
      </div>
    </div>
  );
};
