import { SideBar } from "../../components/Bars/SideBar";
import { MatchingComponent } from "../../components/Matching/MatchingComponent";
export const Matching = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[32%]">
        <MatchingComponent />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
