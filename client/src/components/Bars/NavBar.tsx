import { useNavigate } from "react-router-dom";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useEffect, useState } from "react";
import { NotificationsComponent } from "../Notifications/NotificationsComponent";
import axios from "axios";
import { BACKEND_URL } from "../../config";

export const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotification, setNewNotification] = useState(false);

  const checkUnreadNotification = async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/user/notifications/unread`,
      { token }
    );
    if (response.data.status === 200) {
      if (response.data.data === true) {
        setNewNotification(true);
      } else {
        setNewNotification(false);
      }
    }
  };

  useEffect(() => {
    checkUnreadNotification();
  }, []);

  return (
    <>
      {showNotifications && (
        <NotificationsComponent
          closeComponent={() => {
            setShowNotifications(false);
            setNewNotification(false);
          }}
        />
      )}
      <div
        style={{ zIndex: 100 }}
        className="fixed top-0 left-0 w-full h-12 border-b border-semidark bg-dark"
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <div
            onClick={() => {
              navigate("/");
            }}
            className="cursor-pointer"
          >
            <img src="/friendcity.png" className="h-6 mt-1" alt="friendcity" />
          </div>
          {token && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowNotifications(true);
                }}
                className="relative"
              >
                {newNotification && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-lg h-2 w-2 bg-sky-500"></span>
                  </span>
                )}
                <NotificationsNoneOutlinedIcon
                  sx={{ fontSize: 23 }}
                  className="text-semilight hover:text-white transition-colors"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
