import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import { useLocation, useNavigate } from "react-router-dom";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import JoinInnerIcon from "@mui/icons-material/JoinInner";
import SearchIcon from "@mui/icons-material/Search";

export const SideBarComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex bg-white flex-col justify-between h-screen border-r border-neutral-100">
        <div className="h-[45vh] flex px-8 flex-col justify-evenly items-center">
          <div className="bg-gradient-to-r from-violet-500 to-orange-500  text-transparent bg-clip-text text-4xl font-ubuntu">
            kribble
          </div>

          <button
            onClick={() => {
              navigate("/home");
            }}
            className={`w-full h-10 px-4 border border-indigo-100 rounded-lg bg-indigo-50 flex items-center justify-start gap-2 text-lg font-normal  ${
              location.pathname === "/home"
                ? "text-indigo-700"
                : "text-neutral-800"
            }`}
          >
            <HomeIcon sx={{ fontSize: 30 }} />
            <div>Home</div>
          </button>
          <button
            onClick={() => {
              navigate("/communities");
            }}
            className={`w-full h-10 px-4 border border-indigo-100 rounded-lg bg-indigo-50 flex items-center justify-start gap-2 text-lg font-normal  ${
              location.pathname === "/communities"
                ? "text-indigo-700"
                : "text-neutral-800"
            }`}
          >
            <GroupsRoundedIcon sx={{ fontSize: 30 }} />
            <div>Communities</div>
          </button>

          <button
            onClick={() => {
              navigate("/connect");
            }}
            className={`w-full h-10 px-4 border border-indigo-100 rounded-lg bg-indigo-50 flex items-center justify-start gap-2 text-lg font-normal  ${
              location.pathname === "/connect"
                ? "text-indigo-700"
                : "text-neutral-800"
            }`}
          >
            <JoinInnerIcon sx={{ fontSize: 30 }} />
            <div>Connect</div>
          </button>
          <button
            onClick={() => {
              navigate("/search");
            }}
            className={`w-full h-10 px-4 border border-indigo-100 rounded-lg bg-indigo-50 flex items-center justify-start gap-2 text-lg font-normal  ${
              location.pathname === "/search"
                ? "text-indigo-700"
                : "text-neutral-800"
            }`}
          >
            <SearchIcon sx={{ fontSize: 30 }} />
            <div>Search</div>
          </button>
          <button
            onClick={() => {
              navigate("/create/post");
            }}
            className={
              "w-full h-10 px-4 rounded-lg  bg-indigo-500 text-white flex items-center justify-start gap-2 text-lg font-normal"
            }
          >
            <AddIcon sx={{ fontSize: 30 }} />
            <div>Post</div>
          </button>
        </div>
        <div className="text-xs text-center py-2 font-ubuntu font-normal text-neutral-600">
          © 2024 kribble, a Sen production
        </div>
      </div>
    </>
  );
};
