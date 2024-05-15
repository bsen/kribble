import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import AddIcon from "@mui/icons-material/Add";

import { CircularProgress } from "@mui/material";

interface CommunityData {
  id: string;
  name: string;
  image: string;
  description: string;
  membersCount: string;
  postsCount: string;
}

export const CommunityData: React.FC = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [isCreator, setIsCreator] = useState(Boolean);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoiningLoading, setIsJoiningLoading] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityData>({
    id: "",
    name: "",
    image: "",
    description: "",
    membersCount: "",
    postsCount: "",
  });
  const getCommunityData = async () => {
    try {
      setLoadingState(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/community/profile/data`,
        { token, name }
      );
      setLoadingState(false);
      setCommunityData(response.data.data);
      setIsCreator(response.data.creator);
      setIsJoined(response.data.joined);
    } catch (error) {
      setError(error as Error);
    }
  };

  useEffect(() => {
    getCommunityData();
  }, []);

  const handleJoinCommunity = async () => {
    try {
      setIsJoiningLoading(true);
      setIsJoined((prevState) => !prevState);
      setCommunityData((prevData) => ({
        ...prevData,
        membersCount: isJoined
          ? (parseInt(prevData.membersCount) - 1).toString()
          : (parseInt(prevData.membersCount) + 1).toString(),
      }));

      const details = { token, name };
      await axios.post(`${BACKEND_URL}/api/community/join/join/leave`, details);
    } catch (error) {
      setError(error as Error);
      setIsJoined((prevState) => !prevState);
      setCommunityData((prevData) => ({
        ...prevData,
        membersCount: isJoined
          ? (parseInt(prevData.membersCount) + 1).toString()
          : (parseInt(prevData.membersCount) - 1).toString(),
      }));
    } finally {
      setIsJoiningLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-semibold">
        An error occurred: {error.message}
      </div>
    );
  }

  if (loadingState) {
    return (
      <div className="text-texttwo my-5  font-light text-center text-lg">
        Loading ...
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-bgmain my-2 p-4 rounded-md flex flex-col items-start border border-bordermain">
        <div className="flex justify-between w-full items-center gap-2">
          <img
            src={communityData.image ? communityData.image : "/group.png"}
            className="lg:w-20 lg:h-20 w-16 h-16 rounded-full border border-bordermain mb-2"
          />
          <div className="w-full">
            <div className="flex justify-end items-center">
              <div>
                {isCreator && (
                  <button
                    onClick={() => {
                      navigate(`/edit/community/${communityData.name}`);
                    }}
                    className="text-left text-textmain bg-indigomain font-light rounded-full px-4 py-1 text-sm"
                  >
                    Edit details
                  </button>
                )}

                {!isCreator && (
                  <button
                    onClick={handleJoinCommunity}
                    disabled={isJoiningLoading}
                    className="text-left text-textmain bg-indigomain font-light rounded-full px-4 py-1 text-sm"
                  >
                    <div className="flex items-center justify-center">
                      {isJoiningLoading ? (
                        <CircularProgress
                          size="20px"
                          className="text-sm"
                          color="inherit"
                        />
                      ) : (
                        <div>
                          {isJoined ? <div>Joined</div> : <div>Join</div>}
                        </div>
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>
            <div className="text-lg lg:text-xl  font-semibold text-textmain">
              {communityData.name}
            </div>
            <div className="flex my-2 text-indigomain  items-center gap-2 font-ubuntu text-sm">
              <Link to={`/followers`}>
                <div className="flex gap-1 items-center px-2 py-1/2  bg-bgtwo rounded-md">
                  {communityData.membersCount} Members
                </div>
              </Link>
              <div className="flex gap-1 items-center px-2 py-1/2  bg-bgtwo rounded-md">
                {communityData.postsCount} Posts
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm mb-2 text-texttwo font-light">
          {communityData.description
            ? communityData.description
            : "description"}
        </div>

        <div
          className="w-full flex justify-start items-center"
          onClick={() => {
            navigate(`/${communityData.name}/create/post`);
          }}
        >
          <div
            className={
              "flex w-fit justify-between text-sm items-center text-textmain font-light bg-indigomain px-4 py-1 rounded-full"
            }
          >
            <AddIcon sx={{ fontSize: 20 }} />
            <p>Post</p>
          </div>
        </div>
      </div>
    </>
  );
};
