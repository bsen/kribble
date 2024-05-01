import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SearchBox } from "../HomeComponents/SearchBar";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../config";
interface FollowersData {
  id: string;
  follower: Follower;
}

interface Follower {
  id: string;
  name: string;
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
        `${BACKEND_URL}/api/server/v1/user/followers`,
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
        className="h-screen overflow-y-auto no-scrollbar py-14"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <SearchBox />
        {followersData.followers.length > 0 ? (
          followersData.followers.map((followersObj) => (
            <div
              key={followersObj.id}
              className="border-b hover:bg-neutral-50 border-neutral-200 p-3 bg-white"
            >
              <div className="flex justify-start items-center gap-2">
                <img
                  className="h-10 w-10 rounded-full bg-neutral-50"
                  src={
                    followersObj.follower.image
                      ? followersObj.follower.image
                      : "/user.png"
                  }
                />
                <div>
                  <Link to={`/${followersObj.follower.username}`}>
                    <div className="text-primarytextcolor text-lg font-ubuntu">
                      {followersObj.follower.username}
                    </div>
                  </Link>
                  <Link to={`/${followersObj.follower.username}`}>
                    <div className="text-primarytextcolor text-sm font-light font-ubuntu">
                      @{followersObj.follower.name}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center font-ubuntu my-5 text-primarytextcolor">
            No followers found.
          </div>
        )}
        {isLoading && (
          <div className="text-center my-5">
            <CircularProgress />
          </div>
        )}
      </div>
    </>
  );
};
