import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";

export const BottomBar = () => {
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
      <div className="lg:hidden bottom-0  h-12 flex items-center justify-evenly border-t border-neutral-100  rounded-t-md  bg-white fixed w-full lg:w-[50%]">
        <button
          onClick={() => {
            navigate("/home");
          }}
          className={` rounded-md flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/home"
              ? "text-indigo-500 text-lg"
              : "text-neutral-800"
          }`}
        >
          <HomeOutlinedIcon sx={{ fontSize: 25 }} />
        </button>
        <button
          onClick={() => {
            navigate("/communities");
          }}
          className={` rounded-md flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/communities"
              ? "text-indigo-500 text-lg"
              : "text-neutral-800"
          }`}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 25 }} />
        </button>

        <button
          onClick={() => {
            navigate("/connect");
          }}
          className={` rounded-md flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/connect"
              ? "text-indigo-500 text-lg"
              : "text-neutral-800"
          }`}
        >
          <AllInclusiveIcon sx={{ fontSize: 25 }} />
        </button>
        <button
          onClick={() => {
            navigate(`/${currentUser}`);
          }}
          className={` rounded-md flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === `/${currentUser}`
              ? "text-indigo-500 text-lg"
              : "text-neutral-800"
          }`}
        >
          <PersonOutlinedIcon sx={{ fontSize: 25 }} />
        </button>
        <button
          onClick={() => {
            navigate("/search");
          }}
          className={` rounded-md flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/search"
              ? "text-indigo-500 text-lg"
              : "text-neutral-800"
          }`}
        >
          <SearchOutlinedIcon sx={{ fontSize: 25 }} />
        </button>
      </div>
    </>
  );
};
