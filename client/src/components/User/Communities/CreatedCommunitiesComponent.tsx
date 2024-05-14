import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
export const CreatedCommunitiesComponent = () => {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingState, setDeletingState] = useState(false);
  const [communityId, setCommunityId] = useState("");
  const [popup, setPopup] = useState("");
  const [confirmation, setConfirmation] = useState("");
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

  useEffect(() => {
    setPopup("");
  }, [confirmation]);
  const deleteCommunity = async () => {
    if (confirmation !== "Delete my community") {
      return setPopup(
        "Please confirm the deletion by typing the given senetence"
      );
    }
    setIsLoading(true);
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/community/delete-community`,
      { token, communityId }
    );
    setPopup(response.data.message);
    setIsLoading(false);
    setDeletingState(false);
    window.location.reload();
  };
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
      <div>
        {deletingState ? (
          <div className="w-full h-screen flex justify-center items-center">
            <div>
              <div className="flex flex-col gap-2 text-lg text-center items-center font-ubuntu font-medium">
                Do you really want to delete the community?
                <br />
                <span className="text-base font-normal text-rose-500">
                  Note you can not get back the community
                </span>
                <span className="text-base font-normal text-rose-500">
                  To confirm you deletion Type: "Delete my community"
                </span>
              </div>
              <div>
                <input
                  onChange={(e) => {
                    setConfirmation(e.target.value);
                  }}
                  className=" h-10 w-full my-5 rounded-lg px-4 focus:outline-none border border-neutral-300"
                />
              </div>
              <div className="flex gap-5 justify-evenly items-center">
                <button
                  onClick={deleteCommunity}
                  className="text-white bg-red-500 hover:bg-red-400 font-semibold px-4 py-1  rounded-full"
                >
                  Delete
                </button>

                <button
                  onClick={() => {
                    setCommunityId("");
                    setDeletingState(false);
                  }}
                  className="text-black bg-white hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
                >
                  Cancel
                </button>
              </div>
              <div className="text-red-400 mt-5 font-ubuntu font-light text-center text-sm my-2">
                {popup ? popup : "‎"}
              </div>
            </div>
          </div>
        ) : (
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
                  className="border my-2 rounded-md border-neutral-100 p-4 bg-white"
                >
                  <div className="flex gap-2 justify-between items-start">
                    <div className="flex gap-2 items-start">
                      <img
                        className="h-10 w-10 rounded-full bg-white"
                        src={community.image ? community.image : "/group.png"}
                      />

                      <div className="flex flex-col w-full">
                        <Link
                          to={`/community/${community.name}`}
                          className="text-primarytextcolor w-fit hover:underline underline-offset-2 text-base lg:text-lg font-medium font-ubuntu"
                        >
                          {community.name}
                        </Link>
                        <div className="text-primarytextcolor text-sm  font-normal">
                          {community.description}
                        </div>
                        <div className="text-primarytextcolor font-ubuntu  text-sm font-light">
                          {community.membersCount} members
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCommunityId(community.id);
                        setDeletingState(true);
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: 20 }} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center font-ubuntu my-5 text-primarytextcolor">
                No communities found.
              </div>
            )}
            {isLoading && (
              <div className="text-center my-5">
                <CircularProgress color="inherit" />
              </div>
            )}
          </div>
        )}
        <BottomBar />
      </div>
    </>
  );
};
