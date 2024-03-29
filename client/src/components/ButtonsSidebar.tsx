import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import VideoChatIcon from "@mui/icons-material/VideoChat";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { useLocation, useNavigate } from "react-router-dom";

export const ButtonsSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-max w-full  flex  justify-center items-center bg-black">
      <div className="max-md:flex  max-md:w-full justify-evenly">
        <div>
          <button
            onClick={() => {
              navigate("/home");
            }}
          >
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <HomeIcon
                className={`${
                  location.pathname === "/home" ? "text-blue-500" : "text-logos"
                }`}
              />
              <p
                className={`text-base max-md:hidden ${
                  location.pathname === "/home" ? "text-blue-500" : "text-logos"
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
                    : "text-logos"
                }`}
              />
              <p
                className={`text-base max-md:hidden ${
                  location.pathname === "/profile"
                    ? "text-blue-500"
                    : "text-logos"
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
              navigate("/videochat");
            }}
          >
            <div className={"mt-4 flex items-center justify-center gap-2"}>
              <VideoChatIcon className={"text-logos"} />
              <p className={"text-base text-logos max-md:hidden"}>Video Chat</p>
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
              <PostAddIcon className={"text-logos"} />
              <p className={"text-base text-logos max-md:hidden"}>Post</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
