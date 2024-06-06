import { SideBar } from "../../components/Bars/SideBar";
import { MatchingComponent } from "../../components/Matching/MatchingComponent";
export const Matching = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <MatchingComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
