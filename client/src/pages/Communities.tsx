import { CommunitesComponent } from "../components/Communities/CommunitesComponent";
import { CommunitySuggestions } from "../components/Communities/CommunitySuggestions";
import { Sidebar } from "../components/SideBar/Sidebar";

export const Communities = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <CommunitesComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <CommunitySuggestions />
      </div>
    </div>
  );
};
