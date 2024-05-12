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

export const Data: React.FC = () => {
  const { name } = useParams();
  const navigate = useNavigate();
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
      console.log(error);
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
      console.log(error);
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
  return (
    <>
      {!loadingState && (
        <div className="w-full bg-white my-2 p-4 rounded-md flex flex-col items-start border border-neutral-100">
          <div className="flex justify-between w-full items-center gap-2">
            <img
              src={communityData.image || "/group.png"}
              alt={communityData.name}
              className="w-24 rounded-full borderßborder-neutral-50 mb-2"
            />
            <div className="w-full">
              <div className="flex justify-end items-center">
                <div>
                  {isCreator && (
                    <button
                      onClick={() => {
                        navigate(`/edit/community/${communityData.id}`);
                      }}
                      className="text-left text-white bg-indigo-600 font-light rounded-md px-4 py-1 text-xs"
                    >
                      Edit details
                    </button>
                  )}

                  {!isCreator && (
                    <button
                      onClick={handleJoinCommunity}
                      disabled={isJoiningLoading}
                      className="text-left text-white bg-indigo-600 font-light rounded-md px-4 py-1 text-xs"
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
              <div className="text-lg lg:text-xl  font-semibold text-neutral-800">
                {communityData.name}
              </div>
              <div className="flex my-2 text-indigo-600  items-center gap-2 font-ubuntu text-sm">
                <Link to={`/followers`}>
                  <div className="flex gap-1 items-center px-2 py-1/2  bg-indigo-50 rounded-md">
                    {communityData.membersCount} Members
                  </div>
                </Link>
                <div className="flex gap-1 items-center px-2 py-1/2  bg-indigo-50 rounded-md">
                  {communityData.postsCount} Posts
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-neutral-600 font-light">
            {communityData.description
              ? communityData.description
              : "description"}
          </div>

          <div
            onClick={() => {
              navigate(`/community/${communityData.name}/post`);
            }}
          >
            <div
              className={
                "flex justify-between my-2 text-sm items-center text-neutral-800 font-light bg-indigo-50 px-4 py-1 rounded-full"
              }
            >
              <AddIcon sx={{ fontSize: 20 }} />
              <p>Post</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};