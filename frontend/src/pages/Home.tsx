import { Sidebar } from "../components/Sidebar";
import { HomeComponent } from "../components/HomeComponent";
import { Vitmatch } from "../components/Vitmatch";

export const Home = () => {
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />

      <HomeComponent />

      <Vitmatch />
    </div>
  );
};
