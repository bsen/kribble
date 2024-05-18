import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface MatchesData {
  id: string;
  initiator: Initiator;
}

interface Initiator {
  id: string;
  username: string;
  image: string;
}

export const MatchesComponent = () => {
  const token = localStorage.getItem("token");
  const [matchesData, setMatchesData] = useState<{
    initiators: MatchesData[];
    nextCursor: string | null;
  }>({
    initiators: [],
    nextCursor: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getMatches(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/matches/all/matches`,
        { token, cursor }
      );
      console.log(response.data.data);
      setMatchesData({
        initiators: [...matchesData.initiators, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getMatches();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      matchesData.nextCursor &&
      !isLoading
    ) {
      getMatches(matchesData.nextCursor);
    }
  };

  return (
    <>
      <div className="h-screen absolute w-[50%] bg-white/75 flex justify-center items-center">
        <div
          className="bg-bgmain border border-bordermain shadow-md h-[50vh] rounded-lg w-72 p-2 overflow-y-auto no-scrollbar py-12 md:py-0"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          <div className="flex text-texttwo  justify-center gap-5 items-center py-2">
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="border border-bordermain p-1 rounded-full"
            >
              <ArrowBackIcon />
            </button>
            <div className="text-sm font-ubuntu text-center">Matches</div>
          </div>
          {matchesData.initiators.length > 0 ? (
            matchesData.initiators.map((initiatorObj) => (
              <div
                key={initiatorObj.id}
                className=" my-2 rounded-md border border-bordermain px-2 py-1 bg-bordermain"
              >
                <div className="flex justify-start items-center gap-2">
                  <img
                    className="h-10 w-10 rounded-full bg-bgmain"
                    src={
                      initiatorObj.initiator.image
                        ? initiatorObj.initiator.image
                        : "/user.png"
                    }
                  />
                  <div>
                    <div className="text-textmain text-lg font-ubuntu">
                      {initiatorObj.initiator.username}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-texttwo my-5  font-light text-center text-sm">
              No Matches found
            </div>
          )}
          {isLoading && (
            <div className="text-texttwo my-5  font-light text-center text-sm">
              Loading ...
            </div>
          )}
        </div>
      </div>
    </>
  );
};
