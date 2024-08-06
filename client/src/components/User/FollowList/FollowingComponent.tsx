import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
interface FollowingsData {
  id: string;
  following: Following;
}

interface Following {
  id: string;
  username: string;
  image: string;
}

interface FollowingComponentProps {
  closeComponent: () => void;
}

export const FollowingComponent: React.FC<FollowingComponentProps> = ({
  closeComponent,
}) => {
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const [followingsData, setFollowingsData] = useState<{
    followings: FollowingsData[];
    nextCursor: string | null;
  }>({
    followings: [],
    nextCursor: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getFollowings(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/follow/following/list`,
        { token, cursor, username },
      );
      setFollowingsData({
        followings: [...followingsData.followings, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getFollowings();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      followingsData.nextCursor &&
      !isLoading
    ) {
      getFollowings(followingsData.nextCursor);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-neutral-800 w-[350px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center border-b border-neutral-700 p-4">
          <button
            onClick={closeComponent}
            className="text-white p-1 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <ArrowBackIcon className="w-6 h-6" />
          </button>
          <div className="font-semibold text-white text-lg">Following</div>
          <div className="w-6"></div>
        </div>
        <div
          className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"
          onScroll={handleScroll}
        >
          {followingsData.followings.length > 0 ? (
            followingsData.followings.map((followingObj, index) => (
              <motion.div
                key={followingObj.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center p-2.5 hover:bg-neutral-700 transition-colors"
              >
                <img
                  src={followingObj.following.image || "/user.png"}
                  alt={followingObj.following.username}
                  className="w-10 h-10 rounded-full mr-4 object-cover"
                />
                <div className="flex-1">
                  <Link
                    to={`/${followingObj.following.username}`}
                    className="no-underline text-white hover:underline"
                  >
                    <div className="font-medium">
                      {followingObj.following.username}
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-[200px]"
            >
              {isLoading ? (
                <CircularProgress size={40} sx={{ color: "white" }} />
              ) : (
                <div className="text-neutral-400 text-lg">
                  No following found
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
