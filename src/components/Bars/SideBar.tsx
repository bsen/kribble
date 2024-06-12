import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { UserContext } from "../User/Context/UserContext";
import { useContext } from "react";
import PersonIcon from "@mui/icons-material/Person";

export const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useContext(UserContext);

  return (
    <>
      <div className="flex border border-semidark mt-3 bg-dark flex-col items-center p-4 justify-between h-fit rounded-lg">
        <button
          onClick={() => {
            navigate("/");
          }}
          className={`w-full h-10 px-3 rounded-lg  flex items-center justify-start gap-2   font-medium ${
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
            navigate("/communities");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-medium  ${
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
            navigate("/matching");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-medium  ${
            location.pathname === "/matching"
              ? "text-white text-base bg-semidark"
              : "text-semilight text-sm"
          }`}
        >
          <AllInclusiveIcon sx={{ fontSize: 25 }} />
          <div>Match</div>
        </button>

        <button
          disabled={isLoading}
          onClick={() => {
            navigate(`/${currentUser}`);
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-medium  ${
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
            navigate("/search");
          }}
          className={`w-full h-10 px-3 mt-4 rounded-lg flex items-center justify-start gap-2  font-medium  ${
            location.pathname === "/search"
              ? "text-white text-base bg-semidark"
              : "text-semilight text-sm"
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
            "w-full py-2 px-3 mt-4 rounded-lg  bg-indigomain text-white flex items-center justify-start gap-2 text-base font-medium"
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
