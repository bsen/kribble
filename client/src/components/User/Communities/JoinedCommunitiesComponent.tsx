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
  image: string;
}
export const JoinedCommunitiesComponent = () => {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [communityData, setCommunityData] = useState<{
    communities: Communities[];
    nextCursor: string | null;
  }>({
    communities: [],
    nextCursor: null,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  async function getCommunities(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/communities/all/joined/communities`,
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
        className="h-screen overflow-y-auto no-scrollbar py-12"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        {communityData.communities.length > 0 ? (
          communityData.communities.map((community, index) => (
            <div
              key={index}
              className="border my-2 rounded-md border-bordermain p-4 bg-bgmain"
            >
              <div className="flex gap-2 justify-between items-start">
                <div className="flex gap-2 items-start">
                  <img
                    className="h-10 w-10 rounded-full bg-bgmain"
                    src={community.image ? community.image : "/group.png"}
                  />

                  <div className="flex flex-col w-full">
                    <Link
                      to={`/community/${community.name}`}
                      className="text-textmain w-fit hover:underline underline-offset-2 text-base lg:text-lg font-medium font-ubuntu"
                    >
                      {community.name}
                    </Link>
                    <div className="text-textmain text-sm  font-normal">
                      {community.description}
                    </div>
                    <div className="text-textmain font-ubuntu  text-sm font-light">
                      {community.membersCount} members
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-texttwo my-5  font-light text-center text-lg">
            No communities found.
          </div>
        )}
        {isLoading && (
          <div className="text-center my-5">
            <CircularProgress color="inherit" />
          </div>
        )}
      </div>

      <BottomBar />
    </>
  );
};
