import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";
import { BACKEND_URL } from "../../config";

export const Details: React.FC = () => {
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowUserLoading, setIsFollowUserLoading] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    image: string;
    bio: string;
    website: string;
    interest: string;
    followersCount: string;
    followingCount: string;
  }>({
    name: "",
    username: "",
    image: "",
    bio: "",
    website: "",
    interest: "",
    followersCount: "",
    followingCount: "",
  });

  useEffect(() => {
    getData();
  }, [username]);

  const getData = async () => {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/user-profile-data`,
        { token, username }
      );
      setUserData(response.data.message);
      setCurrentUser(response.data.currentUser);
      setIsFollowing(response.data.following);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  };
  const followUser = async () => {
    try {
      setIsFollowUserLoading(true);
      setIsFollowing((prevState) => !prevState);
      setUserData((prevData) => ({
        ...prevData,
        followersCount: isFollowing
          ? (parseInt(prevData.followersCount) - 1).toString()
          : (parseInt(prevData.followersCount) + 1).toString(),
      }));
      const details = { username, token };
      await axios.post(
        `${BACKEND_URL}/api/server/v1/user/follow-unfollow`,
        details
      );
    } catch (error) {
      console.log(error);
      setIsFollowing((prevState) => !prevState);
      setUserData((prevData) => ({
        ...prevData,
        followersCount: isFollowing
          ? (parseInt(prevData.followersCount) + 1).toString()
          : (parseInt(prevData.followersCount) - 1).toString(),
      }));
    } finally {
      setIsFollowUserLoading(false);
    }
  };
  return (
    <>
      {!loadingState && (
        <div className="p-4 mt-2 rounded-md border border-neutral-100 bg-white">
          <div className="flex w-full justify-start items-center gap-2">
            <img
              src={userData.image ? userData.image : "/user.png"}
              alt="Profile"
              className="w-20 h-20 lg:w-24 lg:h-24 border border-neutral-100 rounded-full"
            />
            <div className="w-full">
              <div className="flex items-center justify-end">
                <div>
                  {currentUser === username ? (
                    <button className="text-left text-white bg-neutral-800 font-light rounded-full px-3 py-1 text-xs">
                      Edit profile
                    </button>
                  ) : (
                    <div className="flex my-2 gap-4 justify-between items-center">
                      <button
                        onClick={followUser}
                        disabled={isFollowUserLoading}
                        className="text-left text-white bg-neutral-800 font-light rounded-full px-3 py-1 text-xs"
                      >
                        {isFollowUserLoading ? (
                          <CircularProgress
                            size="15px"
                            className="text-sm"
                            color="inherit"
                          />
                        ) : (
                          <div>
                            {isFollowing ? (
                              <div>Unfollow</div>
                            ) : (
                              <div>Follow</div>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-base lg:text-lg  font-semibold text-neutral-800">
                  {userData.username}
                </div>
                <div className="text-xs text-neutral-600 font-light">
                  {userData.name}
                </div>
              </div>
            </div>
          </div>
          <div className="flex my-2 text-indigo-600  items-center gap-2 font-ubuntu text-sm">
            <Link to={`/followers/${username}`}>
              <div className="flex gap-1 items-center px-2 py-1/2  bg-indigo-50 rounded-md">
                {userData.followersCount} Followers
              </div>
            </Link>
            <Link to={`/following/${username}`}>
              <div className="flex gap-1 items-center px-2 py-1/2 bg-indigo-50 rounded-md">
                {userData.followingCount} Following
              </div>
            </Link>
          </div>
          <div className="text-sm text-neutral-600 font-light">
            {userData.bio ? userData.bio : "bio"}
          </div>

          <div className="text-sm text-indigo-500 font-light hover:underline">
            <a
              href={`${
                userData.website &&
                (userData.website.startsWith("http://") ||
                  userData.website.startsWith("https://"))
                  ? userData.website
                  : "https://" +
                    (userData.website ? userData.website : "www.kribble.net")
              }`}
              target="_blank"
            >
              {userData.website ? userData.website : "website"}{" "}
              <OpenInNewIcon sx={{ fontSize: 15 }} />
            </a>
          </div>

          {currentUser == username ? (
            <div className="flex my-2 flex-col items-start gap-2">
              <button
                onClick={() => {
                  navigate("/comments");
                }}
                className={
                  "flex justify-between text-sm items-center text-neutral-800 font-light bg-indigo-50 px-4 py-1 rounded-full"
                }
              >
                My comments
              </button>
              <div className="flex justify-between items-center gap-2">
                <button
                  onClick={() => {
                    navigate("/created-communities");
                  }}
                  className={
                    "flex justify-between text-sm items-center text-neutral-800 font-light bg-indigo-50 px-4 py-1 rounded-full"
                  }
                >
                  Created communites
                </button>
                <button
                  onClick={() => {
                    navigate("/my-communities");
                  }}
                  className={
                    "flex justify-between text-sm items-center text-neutral-800 font-light bg-indigo-50 px-4 py-1 rounded-full"
                  }
                >
                  Joined communites
                </button>
              </div>
              <div className="flex justify-between items-center gap-2">
                <button
                  onClick={() => {
                    navigate("/create/post");
                  }}
                >
                  <div
                    className={
                      "flex justify-between text-sm items-center text-neutral-800 font-light bg-indigo-50 px-4 py-1 rounded-full"
                    }
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                    <p>Post</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate("/create/community");
                  }}
                >
                  <div
                    className={
                      "flex justify-between text-sm items-center text-neutral-800 font-light bg-indigo-50 px-4 py-1 rounded-full"
                    }
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                    <p>Community</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};
