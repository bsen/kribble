import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { useLocation, useNavigate } from "react-router-dom";
import JoinInnerIcon from "@mui/icons-material/JoinInner";
import { Link } from "react-router-dom";
export const BottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div className="lg:hidden bottom-0  h-14 flex items-center justify-evenly border-t border-neutral-100 rounded-full  bg-white/95 fixed w-full lg:w-[45%]">
        <button
          onClick={() => {
            navigate("/home");
          }}
        >
          <div className={"flex items-center justify-center gap-2"}>
            <HomeIcon
              sx={{ fontSize: 30 }}
              className={`${
                location.pathname === "/home"
                  ? "text-indigo-500"
                  : "text-primarytextcolor"
              }`}
            />
          </div>
        </button>
        <button>
          <Link to={`/communities`}>
            <div className={" flex items-center justify-center gap-2"}>
              <GroupsRoundedIcon
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === `/communities`
                    ? "text-indigo-500"
                    : "text-primarytextcolor"
                }`}
              />
            </div>
          </Link>
        </button>
        <button>
          <Link to={`/konnect`}>
            <div className={"flex items-center justify-center gap-2"}>
              <JoinInnerIcon
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === `/konnect`
                    ? "text-indigo-500"
                    : "text-primarytextcolor"
                }`}
              />
            </div>
          </Link>
        </button>
        <button>
          <Link to={`/search`}>
            <div className={"flex items-center justify-center gap-2"}>
              <SearchIcon
                sx={{ fontSize: 30 }}
                className={`${
                  location.pathname === `/konnect`
                    ? "text-indigo-500"
                    : "text-primarytextcolor"
                }`}
              />
            </div>
          </Link>
        </button>
      </div>
    </>
  );
};
