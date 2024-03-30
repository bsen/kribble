import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import VideoChatIcon from "@mui/icons-material/VideoChat";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { useLocation, useNavigate } from "react-router-dom";

export const ButtonsSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
                className={`${
                  location.pathname === "/home" ? "text-blue-500" : "text-white"
                }`}
              />
              <p
                className={`text-base max-lg:hidden ${
                  location.pathname === "/home" ? "text-blue-500" : "text-white"
                }`}
              >
                Home
              </p>
            </div>
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              navigate("/profile");
            }}
          >
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <PersonIcon
                className={`${
                  location.pathname === "/profile"
                    ? "text-blue-500"
                    : "text-white"
                }`}
              />
              <p
                className={`text-base max-lg:hidden ${
                  location.pathname === "/profile"
                    ? "text-blue-500"
                    : "text-white"
                }`}
              >
                Profile
              </p>
            </div>
          </button>
        </div>
        <div>
          <button
            className="flex justify-center"
            onClick={() => {
              navigate("/kribbletv");
            }}
          >
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <VideoChatIcon className={"text-white"} />
              <p className={"text-base text-white max-lg:hidden"}>Kribble.Tv</p>
            </div>
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
              <PeopleAltRoundedIcon className={"text-pink-500"} />
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
              <PostAddIcon className={"text-white"} />
              <p className={"text-base text-white max-lg:hidden"}>Post</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
