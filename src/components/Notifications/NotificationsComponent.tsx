import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../Bars/NavBar";

interface NotificationData {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  triggeringUser: {
    id: string;
    username: string;
  };
  post: {
    id: string;
  } | null;
  comment: {
    id: string;
  } | null;
  community: {
    id: string;
    name: string;
  } | null;
}

export const NotificationsComponent = () => {
  const token = localStorage.getItem("token");
  const [notificationsData, setNotificationsData] = useState<{
    notifications: NotificationData[];
    nextCursor: string | null;
  }>({
    notifications: [],
    nextCursor: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  async function getNotifications(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/notifications/all/notifications`,
        { token, cursor }
      );
      setNotificationsData({
        notifications: [
          ...notificationsData.notifications,
          ...response.data.data,
        ],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }
  const updateReadState = async () => {
    await axios.post(`${BACKEND_URL}/api/user/notifications/update-read`, {
      token,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      updateReadState();
    }, 5000);
  }, [notificationsData]);

  useEffect(() => {
    getNotifications();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      notificationsData.nextCursor &&
      !isLoading
    ) {
      getNotifications(notificationsData.nextCursor);
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (notification.post) {
      navigate(`/post/${notification.post.id}`);
    } else if (notification.community) {
      navigate(`/community/${notification.community.name}`);
    } else {
      navigate(`/${notification.triggeringUser.username}`);
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/${username}`);
  };

  return (
    <>
      <NavBar />
      <div
        className="flex justify-center h-screen overflow-y-auto no-scrollbar py-14"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div className="w-full md:w-[35%] px-2">
          {notificationsData.notifications.length > 0 ? (
            notificationsData.notifications.map((notification) => (
              <div
                key={notification.id}
                className="mt-2 rounded-lg border border-semidark p-2 bg-semidark cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div>
                  {notification.triggeringUser && (
                    <div
                      className="flex gap-2 items-center cursor-pointer w-fit"
                      onClick={() => {
                        handleUserClick(notification.triggeringUser.username);
                      }}
                    >
                      <div className="text-light text-sm font-medium">
                        {notification.triggeringUser.username}
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-semilight ">
                    {notification.message}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              {isLoading ? (
                <div className="w-full my-5 flex justify-center items-center">
                  <CircularProgress sx={{ color: "rgb(50 50 50)" }} />
                </div>
              ) : (
                <div className="text-semilight my-5 font-light text-center text-sm">
                  No notifications found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
