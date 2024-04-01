import { Sidebar } from "../components/Sidebar";
import { Profilepage } from "../components/ProfilePage";
import { QuoteMatchMaker } from "../components/QuoteMatchMaker";
export const Profile = () => {
  return (
    <div className="flex  justify-between">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[40%]">
        <Profilepage />
      </div>

      <div className="w-[25%] max-lg:hidden">
        <QuoteMatchMaker />
      </div>
    </div>
  );
};
