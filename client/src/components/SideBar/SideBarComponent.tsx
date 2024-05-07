import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import JoinInnerIcon from "@mui/icons-material/JoinInner";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { BACKEND_URL } from "../../config";

export const SideBarComponent = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState("");

  async function getUser() {
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/current-user`,
      { token }
    );

    setCurrentUser(response.data.data);
  }

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <div className="flex bg-white flex-col justify-between h-screen border-r border-neutral-200">
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col items-start">
            <div className="bg-gradient-to-r from-violet-500 to-orange-500  text-transparent bg-clip-text text-4xl mt-4 font-ubuntu">
              kribble
            </div>
            <button
              onClick={() => {
                navigate("/home");
              }}
            >
              <div
                className={`mt-4 flex items-center justify-center gap-2 text-lg font-medium max-lg:hidden ${
                  location.pathname === "/home"
                    ? "text-indigo-500"
                    : "text-primarytextcolor"
                }`}
              >
                <HomeIcon sx={{ fontSize: 30 }} />
                <div>Home</div>
              </div>
            </button>
            <button>
              <Link to={`/communities`}>
                <div
                  className={`mt-4 flex items-center justify-center gap-2 text-lg font-medium max-lg:hidden ${
                    location.pathname === `/communities`
                      ? "text-indigo-500"
                      : "text-primarytextcolor"
                  }`}
                >
                  <GroupsRoundedIcon sx={{ fontSize: 30 }} />
                  <div>Communities</div>
                </div>
              </Link>
            </button>

            <button>
              <Link to={`/konnect`}>
                <div
                  className={`mt-4 flex items-center justify-center gap-2 text-lg font-medium max-lg:hidden ${
                    location.pathname === `/konnect`
                      ? "text-indigo-500"
                      : "text-primarytextcolor"
                  }`}
                >
                  <JoinInnerIcon sx={{ fontSize: 30 }} />
                  <div>Konnect</div>
                </div>
              </Link>
            </button>

            <button>
              <Link to={`/${currentUser}`}>
                <div
                  className={`mt-4 flex items-center justify-center gap-2 text-lg font-medium max-lg:hidden ${
                    location.pathname === `/${currentUser}`
                      ? "text-indigo-500"
                      : "text-primarytextcolor"
                  }`}
                >
                  <PersonIcon sx={{ fontSize: 30 }} />
                  <div>Profile</div>
                </div>
              </Link>
            </button>
            <button
              onClick={() => {
                navigate("/search");
              }}
            >
              <div
                className={`mt-4 flex items-center justify-center gap-2 text-lg font-medium max-lg:hidden ${
                  location.pathname === "/search"
                    ? "text-indigo-500"
                    : "text-primarytextcolor"
                }`}
              >
                <SearchIcon sx={{ fontSize: 30 }} />
                <div>Search</div>
              </div>
            </button>
            <button
              onClick={() => {
                navigate("/create/post");
              }}
              className="mt-10"
            >
              <div className="px-6 py-1 rounded-full bg-neutral-800 flex items-center justify-center gap-2 text-lg font-medium  text-white">
                <AddIcon sx={{ fontSize: 30 }} />
                <p>Post</p>
              </div>
            </button>
          </div>
        </div>
        <div className="text-sm text-center py-2 font-ubuntu font-normal text-secondarytextcolor">
          © 2024 kribble Ltd
        </div>
      </div>
    </>
  );
};
