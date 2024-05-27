import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import { BottomBar } from "../../Bars/BottomBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";

interface Communities {
  id: string;
  name: string;
  membersCount: string;
  image: string;
}
interface CommunitiesComponentProps {
  closeComponent: () => void;
}
export const CommunitiesComponent: React.FC<CommunitiesComponentProps> = ({
  closeComponent,
}) => {
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
        `${BACKEND_URL}/api/user/communities/all/communities`,
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
      <div className="h-screen absolute w-[50%] bg-black/60 flex justify-center items-center">
        <div
          className="bg-dark border border-semidark shadow-md h-[50vh] rounded-lg w-72 p-2 overflow-y-auto no-scrollbar py-12 md:py-0"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          <div className="flex text-semilight  justify-center gap-5 items-center py-2">
            <button
              onClick={closeComponent}
              className="border border-semidark p-1 rounded-lg"
            >
              <ArrowBackIcon />
            </button>
            <div className="text-sm font-ubuntu text-center">Communities</div>
          </div>
          {communityData.communities.length > 0 ? (
            communityData.communities.map((community, index) => (
              <div
                key={index}
                className="border my-2 rounded-md border-semidark p-1 bg-dark"
              >
                <div className="flex gap-2 justify-between items-start">
                  <div className="flex gap-2 items-start">
                    <img
                      className="h-8 w-8 rounded-full bg-dark"
                      src={community.image ? community.image : "/group.png"}
                    />

                    <div className="flex flex-col w-full">
                      <Link
                        to={`/community/${community.name}`}
                        className="text-light w-fit hover:underline underline-offset-2 text-base lg:text-lg font-medium font-ubuntu"
                      >
                        {community.name}
                      </Link>
                      <div className="text-light font-ubuntu  text-sm font-light">
                        {community.membersCount} members
                      </div>
                    </div>
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
                <div className="text-semilight my-5 font-light text-center text-lg">
                  No communities found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomBar />
    </>
  );
};
