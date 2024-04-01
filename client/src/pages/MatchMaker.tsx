import { Sidebar } from "../components/Sidebar";

import { MatchMakerPage } from "../components/MatchMakerPage";
export const MatchMaker = () => {
  return (
    <div className="lg:flex  bg-neutral-950 justify-between">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[40%]">
        <MatchMakerPage />
      </div>

      <div className="w-full md:w-[25%] border-l border-bordercolor flex justify-center"></div>
    </div>
  );
};
