import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";

interface NotificationData {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  follower: {
    id: string;
    fullname: string;
    username: string;
    image: string;
  } | null;
  post: {
    id: string;
    content: string;
    image: string;
    creator: {
      id: string;
      fullname: string;
      username: string;
      image: string;
    };
  } | null;
  likedBy: {
    id: string;
    username: string;
    image: string;
  } | null;
  comment: {
    id: string;
    content: string;
    creator: {
      id: string;
      fullname: string;
      username: string;
      image: string;
    };
  } | null;
  taggerUser: {
    id: string;
    username: string;
    image: string;
  } | null;
  newCommunityMember: {
    id: string;
    username: string;
    image: string;
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

  return (
    <>
      <div className="h-[calc(100vh-48px)] absolute w-full lg:w-[40%] bg-black/60 flex justify-center items-center">
        <div
          className="bg-dark border border-semidark shadow-md h-[50vh] rounded-lg w-72 p-2 overflow-y-auto no-scrollbar"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          <div className="flex text-semilight  justify-center gap-5 items-center">
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
                className=" my-2 rounded-lg border border-semidark p-2 bg-semidark"
              >
                <div>
                  <div className="text-light text-lg font-ubuntu">
                    {notification.message}
                  </div>
                  {notification.post && (
                    <div>
                      <p>Post: {notification.post.content}</p>
                      <img
                        src={notification.post.image}
                        alt="Post"
                        className="h-20 w-20"
                      />
                    </div>
                  )}
                  {notification.comment && (
                    <div>
                      <p>Comment: {notification.comment.content}</p>
                    </div>
                  )}
                  {notification.follower && (
                    <div>
                      <p>Follower: {notification.follower.username}</p>
                    </div>
                  )}
                  {notification.taggerUser && (
                    <div>
                      <p>Tagged By: {notification.taggerUser.username}</p>
                    </div>
                  )}
                  {notification.newCommunityMember && (
                    <div>
                      <p>
                        New Community Member:{" "}
                        {notification.newCommunityMember.username}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>
              {isLoading ? (
                <div className="w-full my-5 flex justify-center items-center">
                  <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
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
