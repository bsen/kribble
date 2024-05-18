import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface FollowingsData {
  id: string;
  following: Following;
}

interface Following {
  id: string;
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
      <div className="h-screen absolute w-[50%] bg-white/75 flex justify-center items-center">
        <div
          className="bg-bgmain border border-bordermain shadow-md h-[50vh] rounded-lg w-72 p-2 overflow-y-auto no-scrollbar py-12 md:py-0"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          <div className="flex text-texttwo  justify-center gap-5 items-center py-2">
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="border border-bordermain p-1 rounded-full"
            >
              <ArrowBackIcon />
            </button>
            <div className="text-sm font-ubuntu text-center">Following</div>
          </div>
          {followingsData.followings &&
            followingsData.followings.map((followingObj) => (
              <div
                key={followingObj.id}
                className="border my-2 rounded-md border-bordermain px-2 py-1 bg-bgtwo"
              >
                <div className="flex justify-start items-center gap-2">
                  <img
                    className="h-9 w-9 rounded-full bg-bgmain"
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
                  </div>
                </div>
              </div>
            ))}
          {!followingsData.followings && (
            <div className="text-texttwo my-5  font-light text-center text-lg">
              No following found.
            </div>
          )}
          {isLoading && (
            <div className="text-texttwo my-5  font-light text-center text-lg">
              Loading ...
            </div>
          )}
        </div>
      </div>
    </>
  );
};
