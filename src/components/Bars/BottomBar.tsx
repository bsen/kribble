import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { UserContext } from "../User/Context/UserContext";
import { useContext } from "react";
import PersonIcon from "@mui/icons-material/Person";
import LiveTvIcon from "@mui/icons-material/LiveTv";

export const BottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useContext(UserContext);

  return (
    <>
      <div className="bottom-0 lg:hidden w-full  h-12 flex items-center justify-evenly border-t border-semidark  rounded-t-md  bg-dark fixed">
        <button
          onClick={() => {
            navigate("/");
          }}
          className={`py-1 px-2 rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/"
              ? "text-light bg-semidark"
              : "text-semilight"
          }`}
        >
          <HomeOutlinedIcon sx={{ fontSize: 25 }} />
        </button>
        <button
          onClick={() => {
            navigate("/tv");
          }}
          className={`py-1 px-2 rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/tv"
              ? "text-light bg-semidark"
              : "text-semilight"
          }`}
        >
          <LiveTvIcon sx={{ fontSize: 25 }} />
        </button>
        <button
          onClick={() => {
            navigate("/communities");
          }}
          className={`py-1 px-2 rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/communities"
              ? "text-light bg-semidark"
              : "text-semilight"
          }`}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 25 }} />
        </button>
        <button
          onClick={() => {
            navigate("/search");
          }}
          className={`py-1 px-2 rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/search"
              ? "text-light bg-semidark"
              : "text-semilight"
          }`}
        >
          <SearchOutlinedIcon sx={{ fontSize: 25 }} />
        </button>

        <button
          disabled={isLoading}
          onClick={() => {
            navigate(`/${currentUser}`);
          }}
          className={`py-1 px-2 rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === `/${currentUser}`
              ? "text-light bg-semidark"
              : "text-semilight"
          }`}
        >
          <PersonIcon sx={{ fontSize: 25 }} />
        </button>
      </div>
    </>
  );
};
