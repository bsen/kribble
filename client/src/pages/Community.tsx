import { useParams } from "react-router-dom";
import { Sidebar } from "../components/SideBar/Sidebar";
import { Suggestions } from "../components/Communities/Suggestions";

export const Community = () => {
  const { name } = useParams();
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        this is the community page of {name}
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
