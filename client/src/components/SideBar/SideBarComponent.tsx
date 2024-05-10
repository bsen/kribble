import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
export const SideBarComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex bg-white flex-col items-center py-2 justify-between h-screen border-r border-neutral-100">
        <div className="h-[45vh] w-[70%] flex flex-col justify-evenly items-start">
          <div
            onClick={() => {
              navigate("/home");
            }}
            className="bg-gradient-to-r from-violet-500 to-orange-500  text-transparent bg-clip-text text-4xl font-ubuntu"
          >
            kribble
          </div>

          <button
            onClick={() => {
              navigate("/home");
            }}
            className={`w-full h-10 px-4 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === "/home"
                ? "text-indigo-600"
                : "text-neutral-800"
            }`}
          >
            <HomeOutlinedIcon sx={{ fontSize: 25 }} />
            <div>Home</div>
          </button>
          <button
            onClick={() => {
              navigate("/communities");
            }}
            className={`w-full h-10 px-4 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === "/communities"
                ? "text-indigo-600"
                : "text-neutral-800"
            }`}
          >
            <GroupsOutlinedIcon sx={{ fontSize: 25 }} />
            <div>Communities</div>
          </button>

          <button
            onClick={() => {
              navigate("/connect");
            }}
            className={`w-full h-10 px-4 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === "/connect"
                ? "text-indigo-600"
                : "text-neutral-800"
            }`}
          >
            <AllInclusiveIcon sx={{ fontSize: 25 }} />
            <div>Connect</div>
          </button>
          <button
            onClick={() => {
              navigate("/search");
            }}
            className={`w-full h-10 px-4 border border-indigo-100 rounded-md bg-indigo-50 flex items-center justify-start gap-2 text-base font-light  ${
              location.pathname === "/search"
                ? "text-indigo-600"
                : "text-neutral-800"
            }`}
          >
            <SearchOutlinedIcon sx={{ fontSize: 25 }} />
            <div>Search</div>
          </button>
          <button
            onClick={() => {
              navigate("/create/post");
            }}
            className={
              "w-full h-10 px-4 rounded-md  bg-indigo-500 text-white flex items-center justify-start gap-2 text-base font-light"
            }
          >
            <AddIcon sx={{ fontSize: 25 }} />
            <div>Post</div>
          </button>
        </div>
        <div className="text-xs text-center py-2 font-ubuntu font-light text-neutral-600">
          © 2024 kribble, a Sen production
        </div>
      </div>
    </>
  );
};
