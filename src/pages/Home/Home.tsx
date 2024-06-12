import { SideBar } from "../../components/Bars/SideBar";
import { HomeComponent } from "../../components/Home/HomeComponent";
export const Home = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[32%]">
        <HomeComponent />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
