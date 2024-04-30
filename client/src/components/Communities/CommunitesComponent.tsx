import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BottomButtons } from "../Mobile/BottomButtons";
import { Link } from "react-router-dom";
import { SearchBox } from "../HomeComponents/SearchBar";

interface Communities {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: string;
  image: string;
}
export const CommunitesComponent = () => {
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
        `http://localhost:8787/api/server/v1/community/all/communities`,
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
        className="h-screen overflow-y-auto no-scrollbar"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <SearchBox />
        <div className="my-14">
          {communityData.communities.length > 0 ? (
            communityData.communities.map((community, index) => (
              <div
                key={index}
                className="border-b hover:bg-neutral-50 border-neutral-200 p-3 bg-white"
              >
                <Link to={`/community/${community.name}`}>
                  <div className="flex justify-between gap-2">
                    <div className="flex gap-2 w-[90%]">
                      <div className="w-[10%]">
                        <img
                          className="h-10 w-10 rounded-full bg-neutral-50"
                          src={community.image ? community.image : "/group.png"}
                        />
                      </div>
                      <div className="flex flex-col w-full">
                        <div className="text-primarytextcolor text-xl font-medium font-ubuntu">
                          {community.name}
                        </div>
                        <div className="text-primarytextcolor text-sm lg:text-base font-normal">
                          {community.category}
                        </div>
                        <div className="text-primarytextcolor text-sm lg:text-base font-light">
                          {community.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-secondarytextcolor text-center my-2 text-sm font-medium">
                      <span className="text-base">
                        {" "}
                        {community.memberCount}
                      </span>
                      <br /> members
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center font-ubuntu my-5 text-primarytextcolor">
              No posts found.
            </div>
          )}
          {isLoading && (
            <div className="text-center my-5">
              <CircularProgress />
            </div>
          )}
        </div>
        <BottomButtons />
      </div>
    </>
  );
};
