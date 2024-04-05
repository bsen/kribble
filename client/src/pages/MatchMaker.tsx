import { Sidebar } from "../components/Sidebar";

import { MatchMakerPage } from "../components/MatchMaker/MatchMakerPage";
export const MatchMaker = () => {
  return (
    <div className="lg:flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <MatchMakerPage />
      </div>
      <div className="w-full md:w-[30%] border-l border-neutral-200"></div>
    </div>
  );
};
