import { SideBar } from "../../components/Bars/SideBar";
import { HomeComponent } from "../../components/Home/HomeComponent";

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 flex gap-8">
        <div className="w-64 max-md:hidden sticky top-4 h-[calc(100vh-2rem)]">
          <SideBar />
        </div>

        <div className="flex-1 lg:max-w-2xl">
          <HomeComponent />
        </div>

        <div className="w-64 max-lg:hidden"></div>
      </div>
    </div>
  );
};
