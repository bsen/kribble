import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
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
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === "/home"
                    ? "text-blue-500"
                    : "text-neutral-200"
                }`}
              />
              <p
                className={`text-lg font-medium max-lg:hidden ${
                  location.pathname === "/home"
                    ? "text-blue-500"
                    : "text-neutral-200"
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
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === "/profile"
                    ? "text-blue-500"
                    : "text-neutral-200"
                }`}
              />
              <p
                className={`text-lg font-medium max-lg:hidden ${
                  location.pathname === "/profile"
                    ? "text-blue-500"
                    : "text-neutral-200"
                }`}
              >
                Profile
              </p>
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
              <PeopleAltRoundedIcon
                sx={{ fontSize: 30 }}
                className={"text-neutral-200"}
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
                className={"text-neutral-200"}
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
