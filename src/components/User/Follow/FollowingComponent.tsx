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
    <>
      <div className="h-[calc(100vh-48px)] absolute w-full lg:w-[50%] bg-black/60 flex justify-center items-center">
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
            <div className="text-sm font-ubuntu text-center">Following</div>
          </div>
          {followingsData.followings.length > 0 ? (
            followingsData.followings.map((followingObj) => (
              <div
                key={followingObj.id}
                className=" my-2 rounded-lg border border-semidark p-2 bg-semidark"
              >
                <div className="flex justify-start items-center gap-2">
                  <img
                    className="h-7 w-7 rounded-lg bg-dark"
                    src={
                      followingObj.following.image
                        ? followingObj.following.image
                        : "/user.png"
                    }
                  />
                  <div>
                    <Link to={`/${followingObj.following.username}`}>
                      <div className="text-light text-lg font-ubuntu">
                        {followingObj.following.username}
                      </div>
                    </Link>
                  </div>
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
                  No following found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
