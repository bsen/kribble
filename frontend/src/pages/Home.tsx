import { Sidebar } from "../components/Sidebar";
import { HomeComponent } from "../components/HomeComponent";
import { VitDates } from "../components/VitDates";
export const Home = () => {
  return (
    <div className="flex  bg-neutral-950 justify-between">
      <div className="w-[25%]">
        <Sidebar />
      </div>
      <div className="w-[40%]">
        <HomeComponent />
      </div>

      <div className="w-[25%]">
        <VitDates />
      </div>
    </div>
  );
};
