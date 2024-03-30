import { Sidebar } from "../components/Sidebar";
import { Matches } from "../components/Matches";
import { MatchMakerPage } from "../components/MatchMakerPage";
export const MatchMaker = () => {
  return (
    <div className="flex  bg-neutral-950 justify-between">
      <div className="w-[25%] max-md:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[40%]">
        <MatchMakerPage />
      </div>

      <div className="w-[25%] border-l border-bordercolor max-md:hidden flex justify-center">
        <Matches />
      </div>
    </div>
  );
};
