import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
export const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [currentUser, setCurrentUser] = useState("");
  async function getUser() {
    const response = await axios.post(`${BACKEND_URL}/api/user/auth/verify`, {
      token,
    });
    setCurrentUser(response.data.data);
  }

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <div className="flex bg-white flex-col items-center py-2 justify-between h-screen border-r border-neutral-100">
        <div className="h-[50vh] w-[75%] flex flex-col  items-center justify-evenly">
          <div
            onClick={() => {
              navigate("/home");
            }}
            className="bg-gradient-to-r from-indigo-500 via-purple-400 to-violet-500 text-transparent bg-clip-text text-4xl font-ubuntu"
          >
            friensy
          </div>

          <button
            onClick={() => {
              navigate("/home");
            }}
            className={`w-full h-10 px-4 my-2 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === "/home"
                ? "text-indigo-500 text-lg"
                : "text-neutral-800"
            }`}
          >
            <HomeOutlinedIcon sx={{ fontSize: 25 }} />
            <div>Home</div>
          </button>
          <button
            onClick={() => {
              navigate("/communities");
            }}
            className={`w-full h-10 px-4 my-2 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === "/communities"
                ? "text-indigo-500 text-lg"
                : "text-neutral-800"
            }`}
          >
            <GroupsOutlinedIcon sx={{ fontSize: 25 }} />
            <div>Communities</div>
          </button>

          <button
            onClick={() => {
              navigate("/connect");
            }}
            className={`w-full h-10 px-4 my-2 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === "/connect"
                ? "text-indigo-500 text-lg"
                : "text-neutral-800"
            }`}
          >
            <AllInclusiveIcon sx={{ fontSize: 25 }} />
            <div>Connect</div>
          </button>
          <button
            onClick={() => {
              navigate(`/${currentUser}`);
            }}
            className={`w-full h-10 px-4 my-2 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === `/${currentUser}`
                ? "text-indigo-500 text-lg"
                : "text-neutral-800"
            }`}
          >
            <PersonOutlinedIcon sx={{ fontSize: 25 }} />
            <div>Profile</div>
          </button>
          <button
            onClick={() => {
              navigate("/search");
            }}
            className={`w-full h-10 px-4 my-2 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === "/search"
                ? "text-indigo-500 text-lg"
                : "text-neutral-800"
            }`}
          >
            <SearchOutlinedIcon sx={{ fontSize: 25 }} />
            <div>Search</div>
          </button>

          <button
            onClick={() => {
              navigate("/create/post");
            }}
            className={
              "w-full h-10 px-4 my-2 rounded-md  bg-indigo-500 text-white flex items-center justify-start gap-2 text-base font-light"
            }
          >
            <AddIcon sx={{ fontSize: 25 }} />
            <div>Post</div>
          </button>
        </div>
        <div className="text-xs text-center py-2 font-ubuntu font-light text-neutral-600">
          © 2024 kribble, a Sen production
        </div>
      </div>
    </>
  );
};
