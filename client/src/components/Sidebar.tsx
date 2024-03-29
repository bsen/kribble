import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Matches } from "./Matches";
import { ButtonsSidebar } from "./ButtonsSidebar";
export const Sidebar = () => {
  return (
    <>
      <div className="h-screen bg-black border-r  border-bordercolor flex flex-col justify-between items-center">
        <div className="text-[2rem] text-white font-ubuntu flex w-[80%] justify-center items-center border-b border-bordercolor pb-2">
          kribble
        </div>

        <ButtonsSidebar />

        <Matches />
        <div className="my-4   w-full flex items-center justify-center">
          <button>
            <p className="text-logos flex gap-2 hover:text-neutral-300">
              <ExitToAppIcon />
              <p>Logout</p>
            </p>
          </button>
        </div>
      </div>
    </>
  );
};
