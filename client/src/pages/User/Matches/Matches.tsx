import { SideBar } from "../../../components/Bars/SideBar";
import { MatchesComponent } from "../../../components/User/Matches/MatchesComponent";

export const Matches = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full border-l border-r border-bordermain lg:w-[35%]">
        <MatchesComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
