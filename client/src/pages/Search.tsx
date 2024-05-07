import { Suggestions } from "../components/Communities/Suggestions";
import { SearchComponent } from "../components/Search/SearchComponent";
import { SideBar } from "../components/SideBar/SideBar";
export const Search = () => {
  return (
    <div className="flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[45%]">
        <SearchComponent />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
