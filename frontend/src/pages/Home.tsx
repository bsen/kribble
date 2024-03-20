import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { HomeComponent } from "../components/HomeComponent";
import { Suggetions } from "../components/Suggetions";
export const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />
      <div className="h-screen w-[80%] overflow-y-auto no-scrollbar">
        <HomeComponent />
      </div>
      <Suggetions />
    </div>
  );
};
