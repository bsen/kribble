import { Sidebar } from "../components/Sidebar";
import { HomeComponent } from "../components/HomeComponent";
import { Vitmatch } from "../components/Vitmatch";

export const Home = () => {
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />
      <div className="h-screen w-[80%] border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
        <HomeComponent />
      </div>
      <Vitmatch />
    </div>
  );
};
