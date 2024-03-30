import { Sidebar } from "../components/Sidebar";
import { QuoteMatchMaker } from "../components/QuoteMatchMaker";
import { OtherUsersProfilePage } from "../components/OtherUsersProfilePage";
export const OtherUserProfile = () => {
  return (
    <div className="flex  bg-neutral-950 justify-between">
      <div className="w-[25%] max-md:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[40%]">
        <OtherUsersProfilePage />
      </div>

      <div className="w-[25%] max-md:hidden">
        <QuoteMatchMaker />
      </div>
    </div>
  );
};
