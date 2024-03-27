import { Sidebar } from "../components/Sidebar";
import { HomeComponent } from "../components/HomeComponent";
import { Matches } from "../components/Matches";
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
        <Matches />
      </div>
    </div>
  );
};
