import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import { NavBar } from "../../Bars/NavBar";
interface FollowingsData {
  id: string;
  following: Following;
}

interface Following {
  id: string;
  name: string;
  username: string;
  image: string;
}

export const FollowingComponent = () => {
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
      <div
        className="h-screen overflow-y-auto no-scrollbar pt-14"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        {followingsData.followings.length > 0 ? (
          followingsData.followings.map((followingObj) => (
            <div
              key={followingObj.id}
              className="border my-2 rounded-md border-bordermain p-4 bg-bgmain"
            >
              <div className="flex justify-start items-center gap-2">
                <img
                  className="h-10 w-10 rounded-full bg-bgmain"
                  src={
                    followingObj.following.image
                      ? followingObj.following.image
                      : "/user.png"
                  }
                />
                <div>
                  <Link to={`/${followingObj.following.username}`}>
                    <div className="text-textmain text-lg font-ubuntu">
                      {followingObj.following.username}
                    </div>
                  </Link>
                  <Link to={`/${followingObj.following.username}`}>
                    <div className="text-textmain text-sm font-light font-ubuntu">
                      @{followingObj.following.name}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-texttwo my-5  font-light text-center text-lg">
            No following found.
          </div>
        )}
        {isLoading && (
          <div className="text-center my-5">
            <CircularProgress color="inherit" />
          </div>
        )}
      </div>
    </>
  );
};
