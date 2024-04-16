import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
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
    <div className="h-max w-full flex flex-col justify-center items-center">
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
                  ? "text-blue-600"
                  : "text-primarytextcolor"
              }`}
            />
            <p
              className={`text-lg font-medium max-lg:hidden ${
                location.pathname === "/home"
                  ? "text-blue-600"
                  : "text-primarytextcolor"
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
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <PersonIcon
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === `/${currentUser}`
                    ? "text-blue-600"
                    : "text-primarytextcolor"
                }`}
              />
              <p
                className={`text-lg font-medium max-lg:hidden ${
                  location.pathname === `/${currentUser}`
                    ? "text-blue-600"
                    : "text-primarytextcolor"
                }`}
              >
                Profile
              </p>
            </div>
          </Link>
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            navigate("/create/post");
          }}
        >
          <div
            className={
              "mt-4 px-6 py-1 rounded-full bg-blue-600 flex items-center justify-center gap-2 text-lg font-medium  text-white"
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
