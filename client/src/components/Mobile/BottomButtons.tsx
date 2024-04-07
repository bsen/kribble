import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
export const BottomButtons = () => {
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
    <div className="w-full bottom-0  rounded-t-2xl fixed bg-background border-t border-r border-l border-neutral-200 flex justify-evenly items-center text-primarytextcolor font-ubuntu font-semibold text-2xl h-16 lg:hidden">
      <div className="max-lg:flex  max-lg:w-full justify-evenly  items-center">
        <button
          onClick={() => {
            navigate("/home");
          }}
        >
          <div className={"flex flex-col items-center lg:gap-2"}>
            <HomeIcon
              sx={{ fontSize: 30 }}
              className={`${
                location.pathname === "/home"
                  ? "text-blue-500"
                  : "text-secondarytextcolor"
              }`}
            />
            <p
              className={`text-sm lg:text-lg  font-medium ${
                location.pathname === "/home"
                  ? "text-blue-500"
                  : "text-secondarytextcolor"
              }`}
            >
              Home
            </p>
          </div>
        </button>

        <div>
          <button>
            <Link to={`/${currentUser}`}>
              <div
                className={
                  " flex flex-col items-center lg:gap-2 text-secondarytextcolor "
                }
              >
                <PersonIcon
                  sx={{ fontSize: 30 }}
                  className={`${
                    location.pathname === `/${currentUser}`
                      ? "text-blue-500"
                      : "text-secondarytextcolor"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    location.pathname === `/${currentUser}`
                      ? "text-blue-500"
                      : "text-secondarytextcolor"
                  }`}
                >
                  Profile
                </p>
              </div>
            </Link>
          </button>
        </div>

        <div>
          <button>
            <Link to={`/matchmaker`}>
              <div
                className={
                  " flex flex-col items-center lg:gap-2 text-secondarytextcolor "
                }
              >
                <PeopleAltRoundedIcon
                  sx={{ fontSize: 30 }}
                  className={`${
                    location.pathname === `/matchmaker`
                      ? "text-blue-500"
                      : "text-secondarytextcolor"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    location.pathname === `/matchmaker`
                      ? "text-blue-500"
                      : "text-secondarytextcolor"
                  }`}
                >
                  Matches
                </p>
              </div>
            </Link>
          </button>
        </div>

        <button
          className="flex justify-center"
          onClick={() => {
            navigate("/post");
          }}
        >
          <div
            className={
              "flex flex-col items-center  lg:gap-2 text-secondarytextcolor"
            }
          >
            <PostAddIcon sx={{ fontSize: 30 }} />
            <p className={"text-sm lg:text-lg font-medium "}>Post</p>
          </div>
        </button>
      </div>
    </div>
  );
};