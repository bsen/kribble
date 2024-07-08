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
      <div className="flex justify-center min-h-screen text-white">
        <div className="w-full max-w-md p-6">
          <div className="flex flex-col items-center mb-2">
            <NotificationsIcon className="mb-2" fontSize="medium" />
            <h1 className="text-xl font-light">Notifications</h1>
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar"
          >
            {notificationsData.notifications.length > 0 ? (
              notificationsData.notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="mb-4 p-2 bg-semidark rounded-lg cursor-pointer hover:bg-dark transition-colors text-center"
                >
                  {notification.sender && (
                    <div className="font-medium text-blue-500">
                      {notification.sender.username}
                    </div>
                  )}
                  <div className="text-sm text-gray-300 mt-1">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-2 bg-semidark rounded-lg">
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <p className="text-white">No notifications found</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {isLoading && notificationsData.notifications.length > 0 && (
            <div className="text-center mt-4">
              <CircularProgress size={24} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
