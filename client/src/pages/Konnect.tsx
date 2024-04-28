import { Sidebar } from "../components/SideBar/Sidebar";
import { CommunitySuggestions } from "../components/Communities/CommunitySuggestions";

import { KonnectComponent } from "../components/Konnect/KonnectComponent";
export const Konnect = () => {
  return (
    <div className="lg:flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <KonnectComponent />
      </div>
      <div className="w-[30%] max-lg:hidden">
        <CommunitySuggestions />
      </div>
    </div>
  );
};
