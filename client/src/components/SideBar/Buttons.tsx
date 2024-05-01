import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import JoinInnerIcon from "@mui/icons-material/JoinInner";
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
      <div className="flex flex-col items-start">
        <div className="bg-gradient-to-r from-violet-500 via-orange-500 to-indigo-500  text-transparent bg-clip-text text-4xl mt-4 font-ubuntu">
          Kribble
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
          <Link to={`/communities`}>
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <GroupsRoundedIcon
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === `/communities`
                    ? "text-blue-500"
                    : "text-primarytextcolor"
                }`}
              />
              <p
                className={`text-lg font-medium max-lg:hidden ${
                  location.pathname === `/communities`
                    ? "text-blue-500"
                    : "text-primarytextcolor"
                }`}
              >
                Communities
              </p>
            </div>
          </Link>
        </button>
        <button>
          <Link to={`/konnect`}>
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <JoinInnerIcon
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === `/konnect`
                    ? "text-blue-500"
                    : "text-primarytextcolor"
                }`}
              />
              <p
                className={`text-lg font-medium max-lg:hidden ${
                  location.pathname === `/konnect`
                    ? "text-blue-500"
                    : "text-primarytextcolor"
                }`}
              >
                Konnect
              </p>
            </div>
          </Link>
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

        <button
          onClick={() => {
            navigate("/create/post");
          }}
        >
          <div
            className={
              "mt-10 px-6 py-1 rounded-full bg-neutral-800 flex items-center justify-center gap-2 text-lg font-medium  text-white"
            }
          >
            <AddIcon sx={{ fontSize: 30 }} />
            <p>Post</p>
          </div>
        </button>
      </div>
    </div>
  );
};
