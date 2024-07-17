import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { MenuBar } from "../Menu/MenuBar";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsIcon from "@mui/icons-material/Notifications";

interface NotificationData {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
  } | null;
  post: {
    id: string;
  } | null;
  comment: {
    id: string;
  } | null;
}

export const Notifications: React.FC = () => {
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
      setNotificationsData((prevData) => ({
        notifications: [...prevData.notifications, ...response.data.data],
        nextCursor: response.data.nextCursor,
      }));
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  const updateReadState = async () => {
    await axios.post(`${BACKEND_URL}/api/user/notifications/update-read`, {
      token,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateReadState();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notificationsData]);

  useEffect(() => {
    getNotifications();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight - 20 &&
      notificationsData.nextCursor &&
      !isLoading
    ) {
      getNotifications(notificationsData.nextCursor);
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (notification.post) {
      navigate(`/post/${notification.post.id}`);
    } else if (notification.sender) {
      navigate(`/${notification.sender.username}`);
    }
  };

  return (
    <>
      <MenuBar />
      <div className="flex justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="flex sticky flex-col items-center my-2">
            <NotificationsIcon fontSize="medium" className="text-white" />
          </div>
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto  max-h-[88vh] no-scrollbar"
          >
            {notificationsData.notifications.length > 0 ? (
              notificationsData.notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="mb-4 p-2 bg-dark rounded-lg cursor-pointer hover:bg-semidark transition-colors text-center"
                >
                  {notification.sender && (
                    <div className="font-medium text-blue-500">
                      {notification.sender.username}
                    </div>
                  )}
                  <div className="text-sm text-neutral-300 mt-1">
                    {notification.message}
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div>
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <p className="text-white">No Notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {isLoading && notificationsData.notifications.length > 0 && (
            <div className="text-center mt-4">
              <CircularProgress size={24} color="inherit" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
