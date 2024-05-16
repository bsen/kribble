import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import { NavBar } from "../../Bars/NavBar";
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
      <div
        className="h-screen p-2 overflow-y-auto no-scrollbar py-12 md:py-0"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        {followersData.followers &&
          followersData.followers.map((followersObj) => (
            <div
              key={followersObj.id}
              className="border my-2 rounded-md border-bordermain p-4 bg-bgmain"
            >
              <div className="flex justify-start items-center gap-2">
                <img
                  className="h-10 w-10 rounded-full bg-bgmain"
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
          ))}
        {!followersData.followers && (
          <div className="text-texttwo my-5  font-light text-center text-lg">
            No followers found.
          </div>
        )}
        {isLoading && (
          <div className="text-texttwo my-5  font-light text-center text-lg">
            Loading ...
          </div>
        )}
      </div>
    </>
  );
};
