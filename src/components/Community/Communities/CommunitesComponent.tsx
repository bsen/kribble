import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";

interface Communities {
  id: string;
  name: string;
  membersCount: string;
  postsCount: string;
  image: string;
}
export const CommunitiesComponent = () => {
  const token = localStorage.getItem("token");
  const [communityData, setCommunityData] = useState<{
    communities: Communities[];
    nextCursor: string | null;
  }>({
    communities: [],
    nextCursor: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  async function getCommunities(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/communities/all/communities`,
        { token, cursor }
      );
      setCommunityData({
        communities: [...communityData.communities, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getCommunities();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      communityData.nextCursor &&
      !isLoading
    ) {
      getCommunities(communityData.nextCursor);
    }
  };

  return (
    <>
      <div
        className="h-screen overflow-y-auto no-scrollbar py-12 "
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        <div className="text-lg font-ubuntu text-semilight fonr-normal text-center mt-2">
          Communities
        </div>
        {communityData.communities.length > 0 ? (
          communityData.communities.map((community, index) => (
            <div
              key={index}
              className="my-4 p-2 rounded-lg border border-semidark  bg-dark"
            >
              <Link to={`/community/${community.name}`}>
                <div className="flex justify-between gap-2">
                  <div className="flex gap-2 ">
                    <img
                      className="h-7 w-7 rounded-lg bg-dark"
                      src={community.image ? community.image : "/group.png"}
                    />
                    <div className="flex flex-col w-full">
                      <div className="text-light text-base lg:text-lg font-medium font-ubuntu">
                        {community.name}
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="text-light font-light  text-sm">
                          {community.membersCount} members
                        </div>
                        <div className="text-light font-light  text-sm">
                          {community.postsCount} posts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div>
            {isLoading ? (
              <div className="w-full my-5 flex justify-center items-center">
                <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
              </div>
            ) : (
              <div className="text-semilight my-5 font-light text-center text-lg">
                No communities found
              </div>
            )}
          </div>
        )}

        <BottomBar />
      </div>
    </>
  );
};
