import { Sidebar } from "../components/SideBar/Sidebar";
import { CommunitySuggestions } from "../components/Communities/CommunitySuggestions";

import { KribConnectPage } from "../components/KribConnect/KribConectPage";
export const KribConnect = () => {
  return (
    <div className="lg:flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <KribConnectPage />
      </div>
      <div className="w-[30%] max-lg:hidden">
        <CommunitySuggestions />
      </div>
    </div>
  );
};
