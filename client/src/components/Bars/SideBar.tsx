import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useContext } from "react";
import { UserContext } from "../User/Context/UserContext";
export const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useContext(UserContext);

  return (
    <>
      <div className="flex border border-bordermain mt-3 bg-bgmain flex-col items-center p-4 justify-between h-fit rounded-lg">
        <div
          onClick={() => {
            navigate("/");
          }}
          className="bg-gradient-to-r from-indigo-500 to-orange-500 via-purple-500 text-transparent bg-clip-text text-4xl font-ubuntu"
        >
          FriendCity
        </div>

        <button
          onClick={() => {
            navigate("/");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg  flex items-center justify-start gap-2  font-light  ${
            location.pathname === "/"
              ? "text-textmain text-base bg-bgtwo"
              : "text-textmain text-sm"
          }`}
        >
          <HomeOutlinedIcon sx={{ fontSize: 25 }} />
          <div>Home</div>
        </button>
        <button
          onClick={() => {
            navigate("/communities");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-light  ${
            location.pathname === "/communities"
              ? "text-textmain text-base bg-bgtwo"
              : "text-textmain text-sm"
          }`}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 25 }} />
          <div>Communities</div>
        </button>

        <button
          onClick={() => {
            navigate("/matching");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-light  ${
            location.pathname === "/matching"
              ? "text-textmain text-base bg-bgtwo"
              : "text-textmain text-sm"
          }`}
        >
          <AllInclusiveIcon sx={{ fontSize: 25 }} />
          <div>Task Match</div>
        </button>

        <button
          disabled={isLoading}
          onClick={() => {
            navigate(`/${currentUser}`);
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-light  ${
            location.pathname === `/${currentUser}`
              ? "text-textmain text-base bg-bgtwo"
              : "text-textmain text-sm"
          }`}
        >
          <PersonOutlinedIcon sx={{ fontSize: 25 }} />
          <div>Profile</div>
        </button>
        <button
          onClick={() => {
            navigate("/search");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-light  ${
            location.pathname === "/search"
              ? "text-textmain text-base bg-bgtwo"
              : "text-textmain text-sm"
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
            "w-full h-10 px-3 mt-4 rounded-lg  bg-indigomain text-textmain flex items-center justify-start gap-2 text-sm font-light"
          }
        >
          <AddIcon sx={{ fontSize: 25 }} />
          <div>Post</div>
        </button>
      </div>
      <footer className="w-full font-ubuntu py-2 text-xs flex flex-col gap-2 items-center justify-center text-neutral-600">
        © 2024 FriendCity Ltd.
        <Link to="/policies" className="underline">
          Policies
        </Link>
      </footer>
    </>
  );
};
