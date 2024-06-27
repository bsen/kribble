import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { UserContext } from "../User/Context/UserContext";
import { useContext } from "react";
import PersonIcon from "@mui/icons-material/Person";
import LiveTvIcon from "@mui/icons-material/LiveTv";

export const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useContext(UserContext);

  return (
    <>
      <div className="flex border border-semidark mt-2 bg-dark flex-col items-center p-3 justify-between h-fit rounded-lg">
        <button
          onClick={() => {
            navigate("/");
          }}
          className={`w-full h-10 px-3 rounded-lg  flex items-center justify-start gap-2   font-normal ${
            location.pathname === "/"
              ? "text-white text-base bg-semidark"
              : "text-semilight text-sm"
          }`}
        >
          <HomeOutlinedIcon sx={{ fontSize: 25 }} />
          <div>Home</div>
        </button>
        <button
          onClick={() => {
            navigate("/tv");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-normal  ${
            location.pathname === "/tv"
              ? "text-white text-base bg-semidark"
              : "text-semilight text-sm"
          }`}
        >
          <LiveTvIcon sx={{ fontSize: 25 }} />
          <div>Tv</div>
        </button>
        <button
          onClick={() => {
            navigate("/communities");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-normal  ${
            location.pathname === "/communities"
              ? "text-white text-base bg-semidark"
              : "text-semilight text-sm"
          }`}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 25 }} />
          <div>Communities</div>
        </button>
        <button
          onClick={() => {
            navigate("/search");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-normal  ${
            location.pathname === "/search"
              ? "text-white text-base bg-semidark"
              : "text-semilight text-sm"
          }`}
        >
          <SearchOutlinedIcon sx={{ fontSize: 25 }} />
          <div>Search</div>
        </button>
        <button
          disabled={isLoading}
          onClick={() => {
            navigate(`/${currentUser}`);
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-normal  ${
            location.pathname === `/${currentUser}`
              ? "text-white text-base bg-semidark"
              : "text-semilight text-sm"
          }`}
        >
          <PersonIcon sx={{ fontSize: 25 }} />
          <div>Profile</div>
        </button>
        <button
          onClick={() => {
            navigate("/create/post");
          }}
          className={
            "w-full py-2 px-3 mt-4 rounded-lg  bg-indigomain text-white flex items-center justify-start gap-2 text-base font-normal"
          }
        >
          <AddIcon sx={{ fontSize: 25 }} />
          <div>Post</div>
        </button>
      </div>
      <footer className="w-full text-center font-ubuntu py-2 text-xs flex flex-col gap-2 items-center justify-center text-neutral-600">
        © 2024 friendcity. A product by Algabay Private Limited
        <Link to="/policies" className="underline">
          Policies
        </Link>
      </footer>
    </>
  );
};
