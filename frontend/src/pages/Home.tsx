import { Sidebar } from "../components/Sidebar";
import { HomeComponent } from "../components/HomeComponent";
import { VitDates } from "../components/VitDates";
export const Home = () => {
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />
      <div className="w-[80%]">
        <HomeComponent />
      </div>

      <div className="w-[50%]">
        <VitDates />
      </div>
    </div>
  );
};
