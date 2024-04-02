import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
export const ButtonsSidebar = () => {
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
    <div className="h-max w-full  flex  justify-center items-center bg-black">
      <div className="max-lg:flex  max-lg:w-full justify-evenly">
        <div>
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
                    : "text-neutral-100"
                }`}
              />
              <p
                className={`text-lg font-medium max-lg:hidden ${
                  location.pathname === "/home"
                    ? "text-blue-500"
                    : "text-neutral-100"
                }`}
              >
                Home
              </p>
            </div>
          </button>
        </div>
        <div>
          <button>
            <Link to={`/${currentUser}`}>
              <div
                className={
                  "mt-4 flex items-center justify-center gap-2 text-neutral-100"
                }
              >
                <PersonIcon sx={{ fontSize: 30 }} />
                <p className="text-lg font-medium max-lg:hidden">Profile</p>
              </div>
            </Link>
          </button>
        </div>

        <div className="lg:hidden">
          <button
            className="flex justify-center"
            onClick={() => {
              navigate("/matchmaker");
            }}
          >
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <PeopleAltRoundedIcon
                sx={{ fontSize: 30 }}
                className={"text-neutral-100"}
              />
            </div>
          </button>
        </div>
        <div>
          <button
            className="flex justify-center"
            onClick={() => {
              navigate("/post");
            }}
          >
            <div className={"mt-4 flex items-center  gap-2"}>
              <PostAddIcon
                sx={{ fontSize: 30 }}
                className={"text-neutral-100"}
              />
              <p
                className={"text-lg font-medium text-neutral-200 max-lg:hidden"}
              >
                Post
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
