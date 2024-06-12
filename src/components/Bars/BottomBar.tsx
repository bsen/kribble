import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { UserContext } from "../User/Context/UserContext";
import { useContext } from "react";
import PersonIcon from "@mui/icons-material/Person";

export const BottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useContext(UserContext);

  return (
    <>
      <div className="bottom-0 md:hidden  h-12 flex items-center justify-evenly border-t border-semidark  rounded-t-md  bg-dark fixed">
        <button
          onClick={() => {
            navigate("/");
          }}
          className={` rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/"
              ? "text-white bg-semidark"
              : "text-semilight"
          }`}
        >
          <HomeOutlinedIcon sx={{ fontSize: 25 }} />
        </button>
        <button
          onClick={() => {
            navigate("/communities");
          }}
          className={` rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/communities"
              ? "text-white bg-semidark"
              : "text-semilight"
          }`}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 25 }} />
        </button>

        <button
          onClick={() => {
            navigate("/matching");
          }}
          className={` rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/matching"
              ? "text-white bg-semidark"
              : "text-semilight"
          }`}
        >
          <AllInclusiveIcon sx={{ fontSize: 25 }} />
        </button>

        <button
          onClick={() => {
            navigate("/search");
          }}
          className={` rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/search"
              ? "text-white bg-semidark"
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
          className={`rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === `/${currentUser}`
              ? "text-white bg-semidark"
              : "text-semilight"
          }`}
        >
          <PersonIcon sx={{ fontSize: 25 }} />
        </button>
      </div>
    </>
  );
};
