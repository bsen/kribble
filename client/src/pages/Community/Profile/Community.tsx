import { SideBar } from "../../../components/Bars/SideBar";
import { ProfileSection } from "../../../components/Community/Profile/ProfileSection";
export const Community = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full border-l border-r border-bordermain lg:w-[35%]">
        <ProfileSection />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
