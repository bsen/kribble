import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { ButtonsSidebar } from "./ButtonsSidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export const Sidebar = () => {
  const [logState, setLogState] = useState(false);
  const navigate = useNavigate();
  async function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("storageUser");
    navigate("/login");
  }
  return (
    <>
      {logState ? (
        <div className="h-screen w-full absolute bg-black/90 flex justify-center items-center">
          <div className="text-white text-xl font-mono">
            Do you really want to logout?
            <div className="flex justify-evenly my-5">
              <button
                onClick={logout}
                className="text-neutral-300 px-4 py-1 border border-neutral-300 rounded-lg font-thin"
              >
                YES
              </button>
              <button
                onClick={() => {
                  setLogState(false);
                }}
                className="text-neutral-300 px-5 py-1 border border-neutral-300 rounded-lg font-thin"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen bg-black border-r  border-bordercolor flex flex-col justify-between items-center">
          <div className="w-full flex flex-col items-center">
            <div className="text-[2rem] text-white font-ubuntu flex w-[80%] justify-center items-center border-b border-bordercolor pb-2">
              kribble
            </div>

            <ButtonsSidebar />
          </div>

          <div className="my-4   w-full flex items-center justify-center">
            <button
              onClick={() => {
                setLogState(true);
              }}
            >
              <p className="text-logos flex gap-2 hover:text-neutral-300">
                <ExitToAppIcon />
                <p>Logout</p>
              </p>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
