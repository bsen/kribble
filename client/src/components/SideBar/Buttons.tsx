import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

import axios from "axios";
import { BACKEND_URL } from "../../config";
export const Buttons = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState("");
  async function getUser() {
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/user`,
      { token }
    );

    setCurrentUser(response.data.message.username);
  }
  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="h-max w-full flex flex-col justify-center items-center">
      <div className="flex flex-col  items-start">
        <div className="bg-gradient-to-r from-violet-500 via-orange-500 to-indigo-500  text-transparent bg-clip-text text-[2rem] mt-4 font-ubuntu flex w-[80%] justify-center">
          kribble
        </div>
        <button
          onClick={() => {
            navigate("/home");
          }}
        >
          <div className={"mt-4 flex items-center justify-center gap-2"}>
            <HomeIcon
              sx={{ fontSize: 30 }}
              className={`${
                location.pathname === "/home"
                  ? "text-blue-500"
                  : "text-primarytextcolor"
              }`}
            />
            <p
              className={`text-lg font-medium max-lg:hidden ${
                location.pathname === "/home"
                  ? "text-blue-500"
                  : "text-primarytextcolor"
              }`}
            >
              Home
            </p>
          </div>
        </button>

        <button>
          <Link to={`/${currentUser}`}>
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <PersonIcon
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === `/${currentUser}`
                    ? "text-blue-500"
                    : "text-primarytextcolor"
                }`}
              />
              <p
                className={`text-lg font-medium max-lg:hidden ${
                  location.pathname === `/${currentUser}`
                    ? "text-blue-500"
                    : "text-primarytextcolor"
                }`}
              >
                Profile
              </p>
            </div>
          </Link>
        </button>

        <button>
          <Link to={`/kribconnect`}>
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <PeopleAltIcon
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === `/kribconnect`
                    ? "text-blue-500"
                    : "text-primarytextcolor"
                }`}
              />
              <p
                className={`text-lg font-medium max-lg:hidden ${
                  location.pathname === `/kribconnect`
                    ? "text-blue-500"
                    : "text-primarytextcolor"
                }`}
              >
                KribConnect
              </p>
            </div>
          </Link>
        </button>

        <button
          onClick={() => {
            navigate("/create/post");
          }}
        >
          <div
            className={
              "mt-10 px-6 py-1 rounded-full bg-blue-500 flex items-center justify-center gap-2 text-lg font-medium  text-white"
            }
          >
            <PostAddIcon sx={{ fontSize: 30 }} />
            <p>Post</p>
          </div>
        </button>
      </div>
    </div>
  );
};
