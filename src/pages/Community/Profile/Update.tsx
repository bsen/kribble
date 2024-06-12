import { UpdateCommunityComponent } from "../../../components/Community/Update/UpdateComponent";
import { SideBar } from "../../../components/Bars/SideBar";

export const UpdateCommunity = () => {
  return (
    <div
      className="flex justify-evenly 
"
    >
      <div className="w-[16%] max-md:hidden">
        <SideBar />
      </div>
      <div
        className="w-full lg:w-[32%] 
"
      >
        <UpdateCommunityComponent />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
