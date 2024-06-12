import { SideBar } from "../../../components/Bars/SideBar";
import { ProfileSection } from "../../../components/Community/Profile/ProfileSection";
export const Community = () => {
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
        <ProfileSection />
      </div>
      <div className="w-[16%] max-md:hidden"></div>
    </div>
  );
};
