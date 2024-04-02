import { Sidebar } from "../components/Sidebar";
import { ProfileSection } from "../components/ProfileComponents/ProfileSection";
import { QuoteMatchMaker } from "../components/MatchMaker/QuoteMatchMaker";
export const Profile = () => {
  return (
    <div className="flex  justify-between">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[40%]">
        <ProfileSection />
      </div>

      <div className="w-[25%] max-lg:hidden">
        <QuoteMatchMaker />
      </div>
    </div>
  );
};
