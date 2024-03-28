import { Sidebar } from "../components/Sidebar";
import { HomeComponent } from "../components/HomeComponent";
import { MatchMaker } from "../components/MatchMaker";
export const Home = () => {
  return (
    <div className="flex  bg-neutral-950 justify-between">
      <div className="w-[25%] max-md:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[40%]">
        <HomeComponent />
      </div>

      <div className="w-[25%] max-md:hidden">
        <MatchMaker />
      </div>
    </div>
  );
};
