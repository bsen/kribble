import { SideBar } from "../../components/Bars/SideBar";
import { LeaderBoardComponent } from "../../components/LeaderBoard/LeaderBoardComponent";
export const LeaderBoard = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <LeaderBoardComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
