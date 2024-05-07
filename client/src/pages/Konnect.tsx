import { SideBar } from "../components/SideBar/SideBar";
import { Suggestions } from "../components/Communities/Suggestions";
import { KonnectComponent } from "../components/Konnect/KonnectComponent";
export const Konnect = () => {
  return (
    <div className="lg:flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[45%]">
        <KonnectComponent />
      </div>
      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
