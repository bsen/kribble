import { useNavigate } from "react-router-dom";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../User/Context/UserContext";
import { NotificationsComponent } from "../Notifications/NotificationsComponent";
import axios from "axios";
import { BACKEND_URL } from "../../config";
export const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { currentUser, isLoading } = useContext(UserContext);
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
          closeComponent={() => setShowNotifications(false)}
        />
      )}
      <div className="top-0 rounded-b-lg h-12 border-b border-l border-r  border-semidark bg-dark fixed w-full lg:w-[40%]">
        <div className="w-full px-4 h-full text-xl font-ubuntu  flex justify-between items-center text-light">
          <div
            onClick={() => {
              navigate("/");
            }}
            className="bg-gradient-to-r from-indigo-500 to-orange-500 via-purple-500 text-transparent font-normal bg-clip-text text-2xl font-ubuntu"
          >
            FriendCity
          </div>
          {token && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowNotifications(true);
                }}
              >
                {newNotification && (
                  <span className="absolute right-14 top-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-lg h-2 w-2 bg-sky-500"></span>
                  </span>
                )}
                <NotificationsNoneOutlinedIcon
                  sx={{ fontSize: 23 }}
                  className="text-semilight"
                />
              </button>

              <button
                disabled={isLoading}
                onClick={() => {
                  navigate(`/${currentUser}`);
                }}
              >
                <PersonIcon sx={{ fontSize: 25 }} className="text-semilight" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
