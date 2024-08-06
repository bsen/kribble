import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { MenuBar } from "../Menu/MenuBar";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { motion } from "framer-motion";

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
        { token, cursor },
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-black min-h-screen text-white"
    >
      <MenuBar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center mb-6"
        >
          <NotificationsIcon fontSize="large" className="text-white mr-2" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </motion.div>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900"
        >
          {notificationsData.notifications.length > 0 ? (
            notificationsData.notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleNotificationClick(notification)}
                className="mb-4 p-2.5 bg-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
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
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-64"
            >
              {isLoading ? (
                <CircularProgress size={30} sx={{ color: "white" }} />
              ) : (
                <p className="text-neutral-400 text-lg">No Notifications</p>
              )}
            </motion.div>
          )}
        </div>
        {isLoading && notificationsData.notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <CircularProgress size={30} sx={{ color: "white" }} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
