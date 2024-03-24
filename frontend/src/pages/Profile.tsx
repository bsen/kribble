import { Sidebar } from "../components/Sidebar";
import { Profilepage } from "../components/Profilepage";
import { Vitmatch } from "../components/Vitmatch";

export const Profile = () => {
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />
      <div className="w-[80%]">
        <Profilepage />
      </div>

      <div className="w-[50%]">
        <Vitmatch />
      </div>
    </div>
  );
};
