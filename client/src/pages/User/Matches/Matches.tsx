import { SideBar } from "../../../components/Bars/SideBar";
import { MatchesComponent } from "../../../components/User/Matches/MatchesComponent";

export const Matches = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <MatchesComponent />
      </div>
      <div className="w-[22%] max-lg:hidden"></div>
    </div>
  );
};
