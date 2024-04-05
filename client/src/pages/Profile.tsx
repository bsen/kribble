import { Sidebar } from "../components/Sidebar";
import { ProfileSection } from "../components/ProfileComponents/ProfileSection";
import { MatchMakerPage } from "../components/MatchMaker/MatchMakerPage";
export const Profile = () => {
  return (
    <div className="flex justify-between bg-background">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[45%]">
        <ProfileSection />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <MatchMakerPage />
      </div>
    </div>
  );
};
