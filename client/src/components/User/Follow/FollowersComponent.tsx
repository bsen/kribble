import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface FollowersData {
  id: string;
  follower: Follower;
}

interface Follower {
  id: string;
  username: string;
  image: string;
}

export const FollowersComponent = () => {
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const [followersData, setFollowersData] = useState<{
    followers: FollowersData[];
    nextCursor: string | null;
  }>({
    followers: [],
    nextCursor: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getFollowers(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/follow/followers/list`,
        { token, cursor, username }
      );
      console.log(response.data.data);
      setFollowersData({
        followers: [...followersData.followers, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getFollowers();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      followersData.nextCursor &&
      !isLoading
    ) {
      getFollowers(followersData.nextCursor);
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
              className="border border-bordermain p-1 rounded-lg"
            >
              <ArrowBackIcon />
            </button>
            <div className="text-sm font-ubuntu text-center">Followers</div>
          </div>
          {followersData.followers.length > 0 ? (
            followersData.followers.map((followersObj) => (
              <div
                key={followersObj.id}
                className=" my-2 rounded-lg border border-bordermain px-2 py-1 bg-bordermain"
              >
                <div className="flex justify-start items-center gap-2">
                  <img
                    className="h-10 w-10 rounded-lg bg-bgmain"
                    src={
                      followersObj.follower.image
                        ? followersObj.follower.image
                        : "/user.png"
                    }
                  />
                  <div>
                    <Link to={`/${followersObj.follower.username}`}>
                      <div className="text-textmain text-lg font-ubuntu">
                        {followersObj.follower.username}
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-texttwo my-5  font-light text-center text-sm">
              No followers found
            </div>
          )}
          {isLoading && (
            <div className="text-texttwo my-5  font-light text-center text-sm">
              Loading ...
            </div>
          )}
        </div>
      </div>
    </>
  );
};
