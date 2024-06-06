import { SideBar } from "../../components/Bars/SideBar";
import { CityTalksComponent } from "../../components/CityTalks/CityTalksComponent";
export const CityTalks = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <CityTalksComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
