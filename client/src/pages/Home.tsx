import { Sidebar } from "../components/Sidebar";
import { PostsHome } from "../components/HomeComponents/PostsHome";
import { QuoteMatchMaker } from "../components/MatchMaker/QuoteMatchMaker";
export const Home = () => {
  return (
    <div className="flex justify-between">
      <div className="w-[25%] max-lg:hidden">
        <Sidebar />
      </div>
      <div className="w-full lg:w-[40%]">
        <PostsHome />
      </div>

      <div className="w-[25%] max-lg:hidden">
        <QuoteMatchMaker />
      </div>
    </div>
  );
};
