import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";

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
        { token, cursor, username }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#262626] w-[300px] max-h-[80vh] rounded-lg shadow-xl flex flex-col">
        <div className="flex justify-between items-center border-b border-[#363636] p-2">
          <button onClick={closeComponent} className="text-white p-1">
            <ArrowBackIcon className="w-6 h-6" />
          </button>
          <div className="font-semibold text-white">Following</div>
          <div className="w-6"></div>
        </div>
        <div
          className="overflow-y-auto flex-1 scrollbar-hide"
          onScroll={handleScroll}
        >
          {followingsData.followings.length > 0 ? (
            followingsData.followings.map((followingObj) => (
              <div
                key={followingObj.id}
                className="flex items-center p-2 border-b border-[#363636]"
              >
                <img
                  src={followingObj.following.image || "/user.png"}
                  alt={followingObj.following.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <Link
                    to={`/${followingObj.following.username}`}
                    className="no-underline text-white"
                  >
                    <div>{followingObj.following.username}</div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-[200px]">
              {isLoading ? (
                <CircularProgress sx={{ color: "inherit" }} />
              ) : (
                <div className="text-[#a8a8a8] text-sm">No following found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
