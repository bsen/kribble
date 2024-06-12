import { SideBar } from "../../components/Bars/SideBar";
import { SearchComponent } from "../../components/Search/SearchComponent";

export const Search = () => {
  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[32%]">
        <SearchComponent />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
