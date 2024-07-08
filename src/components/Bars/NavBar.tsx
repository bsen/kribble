import React, { useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { UserContext } from "../User/Context/UserContext";
import { NotificationsComponent } from "../Notifications/NotificationsComponent";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CreateIcon from "@mui/icons-material/Create";
import WorkspacesIcon from "@mui/icons-material/Workspaces";

interface NavButtonProps {
  to: string;
  icon: ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ to, icon }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <button
      onClick={() => navigate(to)}
      className={`px-6 py-2 rounded-lg ${
        location.pathname === to
          ? "text-white text-base bg-semidark"
          : "text-semilight text-sm hover:bg-semidark hover:text-white"
      }`}
    >
      {icon}
    </button>
  );
};

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { currentUser, isLoading } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [newNotification, setNewNotification] = useState<boolean>(false);

  const checkUnreadNotification = async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/user/notifications/unread`,
      { token }
    );
    if (response.data.status === 200) {
      setNewNotification(response.data.data === true);
    }
  };

  useEffect(() => {
    if (token) checkUnreadNotification();
  }, [token]);

  return (
    <>
      <div
        style={{ zIndex: 100 }}
        className="h-14 w-full fixed bottom-0 bg-red-600/80 backdrop-filter backdrop-blur-md "
      >
        <div className="max-w-6xl mx-auto px-4 h-full flex justify-between items-center">
          <div
            onClick={() => navigate("/")}
            className="text-white/80 text-2xl font-ubuntu font-light cursor-pointer"
          >
            Fc
          </div>

          <div className="hidden md:flex items-center gap-4">
            <NavButton to="/" icon={<HomeIcon sx={{ fontSize: 25 }} />} />

            <NavButton
              to="/communities"
              icon={<WorkspacesIcon sx={{ fontSize: 25 }} />}
            />
            <NavButton
              to="/create"
              icon={<CreateIcon sx={{ fontSize: 25 }} />}
            />
            <NavButton
              to="/search"
              icon={<SearchIcon sx={{ fontSize: 25 }} />}
            />
            {token && (
              <NavButton
                to="/notifs"
                icon={
                  <div className="relative">
                    {newNotification && (
                      <span className="absolute -right-0.5 top-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rosemain opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rosemain"></span>
                      </span>
                    )}
                    <FavoriteIcon sx={{ fontSize: 25 }} />
                  </div>
                }
              />
            )}
          </div>
          <button
            onClick={() =>
              !isLoading && currentUser && navigate(`/${currentUser}`)
            }
            disabled={isLoading || !currentUser}
            className={`py-2 rounded-lg flex items-center justify-start gap-2 font-normal ${
              isLoading || !currentUser
                ? "text-semilight text-sm cursor-not-allowed opacity-50"
                : "text-semilight text-sm hover:bg-semidark hover:text-white"
            }`}
          >
            <PersonIcon sx={{ fontSize: 25 }} />
          </button>
        </div>
      </div>
    </>
  );
};
