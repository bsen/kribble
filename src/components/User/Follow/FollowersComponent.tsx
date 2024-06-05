import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";

interface FollowersData {
  id: string;
  follower: Follower;
}

interface Follower {
  id: string;
  username: string;
  image: string;
}

interface FollowersComponentProps {
  closeComponent: () => void;
}

export const FollowersComponent: React.FC<FollowersComponentProps> = ({
  closeComponent,
}) => {
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
      <div className="h-[calc(100vh-48px)] absolute w-full lg:w-[40%] bg-black/80 flex justify-center items-center">
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
            <div className="text-sm font-ubuntu text-center">Followers</div>
          </div>
          {followersData.followers.length > 0 ? (
            followersData.followers.map((followersObj) => (
              <div
                key={followersObj.id}
                className=" my-2 rounded-lg border border-semidark p-2 bg-semidark"
              >
                <div className="flex justify-start items-center gap-2">
                  <img
                    className="h-7 w-7 rounded-lg bg-dark"
                    src={
                      followersObj.follower.image
                        ? followersObj.follower.image
                        : "/user.png"
                    }
                  />
                  <div>
                    <Link to={`/${followersObj.follower.username}`}>
                      <div className="text-light text-lg font-ubuntu">
                        {followersObj.follower.username}
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
                  No followers found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
