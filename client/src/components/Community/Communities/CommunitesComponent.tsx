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
  description: string;
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
  if (isLoading) {
    <div className="text-center my-5">
      <CircularProgress />
    </div>;
  }

  return (
    <>
      <div
        className="h-screen p-2 overflow-y-auto no-scrollbar py-12 md:py-0"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        {communityData.communities &&
          communityData.communities.map((community, index) => (
            <div
              key={index}
              className="my-4 p-2 rounded-md border border-bordermain  bg-bgmain"
            >
              <Link to={`/community/${community.name}`}>
                <div className="flex justify-between gap-2">
                  <div className="flex gap-2 ">
                    <img
                      className="h-9 w-9 rounded-full bg-bgmain"
                      src={community.image ? community.image : "/group.png"}
                    />
                    <div className="flex flex-col w-full">
                      <div className="text-textmain text-base lg:text-lg font-medium font-ubuntu">
                        {community.name}
                      </div>
                      <div className="text-textmain text-sm  font-normal">
                        {community.description}
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="text-textmain font-light  text-sm">
                          {community.membersCount} members
                        </div>
                        <div className="text-textmain font-light  text-sm">
                          {community.postsCount} posts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        {!communityData.communities && (
          <div className="text-texttwo my-5  font-light text-center text-lg">
            No communities found
          </div>
        )}

        <BottomBar />
      </div>
    </>
  );
};
