import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

export const BottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <div className="lg:hidden bottom-0  h-12 flex items-center justify-evenly border-t border-semidark  rounded-t-md  bg-dark fixed w-full">
        <button
          onClick={() => {
            navigate("/");
          }}
          className={` rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/" ? "text-indigomain text-lg" : "text-light"
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
              ? "text-indigomain text-lg"
              : "text-light"
          }`}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 25 }} />
        </button>

        {/* <button
          onClick={() => {
            navigate("/matching");
          }}
          className={` rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/matching"
              ? "text-indigomain text-lg"
              : "text-light"
          }`}
        >
          <AllInclusiveIcon sx={{ fontSize: 25 }} />
        </button> */}

        <button
          onClick={() => {
            navigate("/search");
          }}
          className={` rounded-lg flex items-center justify-start gap-2 text-base font-light  ${
            location.pathname === "/search"
              ? "text-indigomain text-lg"
              : "text-light"
          }`}
        >
          <SearchOutlinedIcon sx={{ fontSize: 25 }} />
        </button>
      </div>
    </>
  );
};
