import { Sidebar } from "../components/Sidebar";
import { HomePage } from "../components/HomePage";
import { QuoteMatchMaker } from "../components/QuoteMatchMaker";
export const Home = () => {
  return (
    <div className="flex justify-between">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[40%]">
        <HomePage />
      </div>

      <div className="w-[25%] max-lg:hidden">
        <QuoteMatchMaker />
      </div>
    </div>
  );
};
