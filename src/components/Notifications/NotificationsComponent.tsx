import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface NotificationData {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  triggeringUser: {
    id: string;
    username: string;
    image: string;
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

interface NotificationComponentProps {
  closeComponent: () => void;
}

export const NotificationsComponent: React.FC<NotificationComponentProps> = ({
  closeComponent,
}) => {
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
      <div className="h-[calc(100vh-48px)] absolute w-full lg:w-[34%] bg-black/60 flex justify-center items-center">
        <div
          className="bg-dark border border-semidark shadow-md h-[50vh] rounded-lg w-72 p-2 overflow-y-auto no-scrollbar"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          <div className="flex text-semilight justify-center gap-5 items-center">
            <button
              onClick={closeComponent}
              className="border border-semidark p-1 rounded-lg"
            >
              <ArrowBackIcon />
            </button>
            <div className="text-sm font-ubuntu text-center">Notifications</div>
          </div>
          {notificationsData.notifications.length > 0 ? (
            notificationsData.notifications.map((notification) => (
              <div
                key={notification.id}
                className="mt-2 rounded-lg border border-semidark p-2 bg-semidark cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div>
                  <div
                    className="flex gap-2 items-center cursor-pointer w-fit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(notification.triggeringUser.username);
                    }}
                  >
                    <img
                      className="h-7 w-7 rounded-lg bg-dark"
                      src={
                        notification.triggeringUser.image
                          ? notification.triggeringUser.image
                          : "/user.png"
                      }
                    />
                    <div className="text-light text-sm font-medium">
                      {notification.triggeringUser.username}
                    </div>
                  </div>
                  <div className="text-sm text-semilight mt-1">
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
