import { CircularProgress, LinearProgress } from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { BACKEND_URL } from "../../../config";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";

interface Communities {
  id: string;
  name: string;
  image: string;
}

export const CommunitiesComponent = () => {
  const [search, setSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [communityData, setCommunityData] = useState<{
    communities: Communities[];
    nextCursor: string | null;
  }>({
    communities: [],
    nextCursor: null,
  });
  const [filteredCommunities, setFilteredCommunities] = useState<Communities[]>(
    []
  );

  const handleSearchingCommunityNameChange = (text: string) => {
    const searchingName = text.toLowerCase();
    setSearch(searchingName);
  };

  const fetchSearchResults = useCallback(async () => {
    setIsSearching(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/search/communities`,
        {
          search,
        }
      );
      setFilteredCommunities(response.data.communities);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsSearching(false);
    }
  }, [search]);

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  }

  const debouncedSearch = useCallback(debounce(fetchSearchResults, 1000), [
    fetchSearchResults,
  ]);

  useEffect(() => {
    if (search.length !== 0) {
      debouncedSearch();
    } else {
      setFilteredCommunities([]);
    }
  }, [search, debouncedSearch]);

  async function getCommunities(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/communities/all/communities`,
        { cursor }
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
        {isSearching && <LinearProgress sx={{ backgroundColor: "black" }} />}

        <div className="w-full h-14 flex justify-between items-center">
          <div className="h-10 bg-dark mx-auto w-full hover:bg-semidark flex px-4 justify-between items-center border border-semidark rounded-lg">
            <input
              type="text"
              value={search}
              onChange={(e) =>
                handleSearchingCommunityNameChange(e.target.value)
              }
              placeholder="Search communities"
              className="w-full h-full bg-dark hover:bg-semidark text-semilight focus:outline-none"
            />
            <SearchIcon className="text-semilight" />
          </div>
        </div>
        {search.length > 0 ? (
          filteredCommunities.length > 0 ? (
            filteredCommunities.map((community, index) => (
              <div
                key={index}
                className="mb-2 p-2 rounded-lg border border-semidark bg-dark"
              >
                <Link to={`/community/${community.name}`}>
                  <div className="flex justify-between gap-2">
                    <div className="flex gap-2">
                      <img
                        className="h-7 w-7 rounded-lg bg-dark"
                        src={community.image ? community.image : "/group.png"}
                        alt={community.name}
                      />
                      <div className="flex flex-col w-full">
                        <div className="text-light text-base font-normal font-ubuntu">
                          {community.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-semilight my-5 font-light text-center text-sm">
              No communities found
            </div>
          )
        ) : communityData.communities.length > 0 ? (
          communityData.communities.map((community, index) => (
            <div
              key={index}
              className="mb-2 p-2 rounded-lg border border-semidark bg-dark"
            >
              <Link to={`/community/${community.name}`}>
                <div className="flex justify-between gap-2">
                  <div className="flex gap-2">
                    <img
                      className="h-7 w-7 rounded-lg bg-dark"
                      src={community.image ? community.image : "/group.png"}
                      alt={community.name}
                    />
                    <div className="flex flex-col w-full">
                      <div className="text-light text-base font-normal font-ubuntu">
                        {community.name}
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
              <div className="text-semilight my-5 font-light text-center text-sm">
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
