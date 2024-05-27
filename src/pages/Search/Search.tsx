import { SideBar } from "../../components/Bars/SideBar";
import { SearchComponent } from "../../components/Search/SearchComponent";

export const Search = () => {
  return (
    <div
      className="flex justify-evenly 
"
    >
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div
        className="w-full lg:w-[40%] 
"
      >
        <SearchComponent />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};