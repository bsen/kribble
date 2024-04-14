import { Sidebar } from "../components/Sidebar";
import { PostsHome } from "../components/HomeComponents/PostsHome";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KribConnectPage } from "../components/KribConnect/KribConectPage";
export const Home = () => {
  const [errorState, setErrorState] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  useEffect(() => {
    User();
  }, []);
  async function User() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/user`,
        { token }
      );

      if (response.data.status === 401) {
        setErrorState(true);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="flex justify-between bg-background">
      {errorState ? (
        <div className="text-primarytextcolor h-screen w-full font-lg font-ubuntu font-semibold flex justify-center items-center">
          <div className="flex flex-col items-center gap-5">
            <div>Netwoerk error, please logout and try again later</div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="text-black bg-white hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
            >
              Log out
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="w-[25%] max-lg:hidden">
            <Sidebar />
          </div>
          <div className="w-full lg:w-[45%]">
            <PostsHome />
          </div>
          <div className="w-[30%] max-lg:hidden">
            <KribConnectPage />
          </div>
        </>
      )}
    </div>
  );
};
