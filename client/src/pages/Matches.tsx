import { Sidebar } from "../components/SideBar/Sidebar";
import { CommunitySuggestions } from "../components/Communities/CommunitySuggestions";
import { MatchesComponent } from "../components/KribConnect/MatchesComponent";
export const Matches = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <MatchesComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <CommunitySuggestions />
      </div>
    </div>
  );
};
