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
    <div className="bg-dark h-screen text-white">
      <MenuBar />
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center mb-2">
          <NotificationsIcon fontSize="large" className="text-white mr-2" />
          <h1 className="text-xl">Notifications</h1>
        </div>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900"
        >
          {notificationsData.notifications.length > 0 ? (
            notificationsData.notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="mb-4 p-2.5 bg-semidark rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
              >
                {notification.sender && (
                  <div className="font-medium text-white mb-1">
                    {notification.sender.username}
                  </div>
                )}
                <div className="text-sm text-neutral-300">
                  {notification.message}
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center">
              {isLoading ? (
                <CircularProgress size={30} sx={{ color: "white" }} />
              ) : (
                <p className="text-neutral-400 text-lg">No Notifications</p>
              )}
            </div>
          )}
        </div>
        {isLoading && notificationsData.notifications.length > 0 && (
          <div className="text-center mt-4">
            <CircularProgress size={30} sx={{ color: "white" }} />
          </div>
        )}
      </div>
    </div>
  );
};
