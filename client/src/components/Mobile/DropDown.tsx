import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { useLocation, useNavigate } from "react-router-dom";
import JoinInnerIcon from "@mui/icons-material/JoinInner";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
export const DropDown = () => {
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
    <>
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
            className={`text-lg font-medium ${
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
              className={`text-lg font-medium  ${
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
              className={`text-lg font-medium  ${
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
              className={`text-lg font-medium  ${
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
    </>
  );
};
