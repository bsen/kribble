import { SideBar } from "../../components/Bars/SideBar";
import { HomeComponent } from "../../components/Home/HomeComponent";
export const Home = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%]">
        <HomeComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
