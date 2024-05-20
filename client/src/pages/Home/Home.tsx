import { SideBar } from "../../components/Bars/SideBar";
import { HomeComponent } from "../../components/Home/HomeComponent";
export const Home = () => {
  return (
    <div className="flex justify-evenly bg-bgblack">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%] bg-bgblack">
        <HomeComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
