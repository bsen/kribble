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
                className="border-b border-neutral-200 p-3 bg-white"
              >
                <div>
                  <div className="flex gap-2">
                    <div className="flex gap-2 items-center">
                      <Link to={`/${community.name}`}>
                        <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                          {community.name}
                        </div>
                      </Link>
                      <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                        members {community.memberCount}
                      </div>
                    </div>
                    <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                      catagory {community.category}
                    </div>
                    <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                      description {community.description}
                    </div>

                    <div>
                      <div className="flex gap-2 text-neutral-600"></div>
                    </div>
                  </div>
                </div>
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
