import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";
import { BACKEND_URL } from "../../../config";
import { UserContext } from "../Context/UserContext";
interface UserData {
  fullname: string;
  username: string;
  image: string;
  bio: string;
  website: string;
  followersCount: string;
  followingCount: string;
}

export const UserData: React.FC = () => {
  const { username } = useParams();
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowUserLoading, setIsFollowUserLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    fullname: "",
    username: "",
    image: "",
    bio: "",
    website: "",
    followersCount: "",
    followingCount: "",
  });
  const [error, setError] = useState<Error | null>(null);
  const getUserData = useCallback(async () => {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/profile/data`,
        { token, username }
      );
      setUserData(response.data.message);
      setIsFollowing(response.data.following);
      setLoadingState(false);
    } catch (error) {
      setError(error as Error);
      setLoadingState(false);
    }
  }, [token, username]);
  useEffect(() => {
    getUserData();
  }, [username]);

  const followUser = useCallback(async () => {
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
        `${BACKEND_URL}/api/user/follow/follow/unfollow`,
        details
      );
    } catch (error) {
      setError(error as Error);
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
  }, [isFollowing, token, username]);

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-semibold">
        An error occurred: {error.message}
      </div>
    );
  }

  if (loadingState) {
    return (
      <div className="text-neutral-600 my-5  font-light text-center text-lg">
        Loading ...
      </div>
    );
  }

  return (
    <div className="p-4 mt-2 rounded-md border border-neutral-100 bg-white">
      <div className="flex w-full justify-start items-center gap-2">
        <img
          src={userData.image ? userData.image : "/user.png"}
          className="lg:w-20 lg:h-20 w-16 h-16 rounded-full border border-neutral-50 mb-2"
        />

        <div className="w-full">
          <div className="flex items-center justify-end">
            <div>
              {currentUser === username && (
                <button
                  onClick={() => {
                    navigate("/edit/profile");
                  }}
                  className="text-left text-white bg-indigo-500 font-light rounded-full px-4 py-1 text-sm"
                >
                  Edit
                </button>
              )}
              {currentUser !== username && (
                <div className="flex my-2 gap-4 justify-between items-center">
                  <button
                    onClick={followUser}
                    disabled={isFollowUserLoading}
                    className="text-left flex justify-center items-center text-white bg-indigo-500 font-light rounded-full px-4 py-1 text-sm"
                  >
                    {isFollowUserLoading ? (
                      <CircularProgress
                        size="15px"
                        className="text-sm"
                        color="inherit"
                      />
                    ) : (
                      <div>
                        {isFollowing ? <div>Unfollow</div> : <div>Follow</div>}
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="text-base lg:text-lg font-semibold text-neutral-800">
              {userData.username}
            </div>
            <div className="text-xs text-neutral-600 font-light">
              {userData.fullname}
            </div>
          </div>
        </div>
      </div>
      <div className="flex my-2 text-indigo-500 items-center gap-2 font-ubuntu text-sm">
        <Link to={`/followers/${username}`}>
          <div className="flex gap-1 items-center px-2 py-1/2 bg-indigo-50 rounded-md">
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

      <div className="text-sm text-indigo-5000 font-light hover:underline">
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
          rel="noopener noreferrer"
        >
          {userData.website ? userData.website : "website"}{" "}
          <OpenInNewIcon sx={{ fontSize: 15 }} />
        </a>
      </div>

      {currentUser === username && (
        <div className="flex my-2 flex-col items-start gap-2">
          <button
            onClick={() => {
              navigate("/comments");
            }}
            className={
              "flex justify-between text-sm items-center text-indigo-500 font-light bg-indigo-50 px-4 py-1 rounded-full"
            }
          >
            My comments
          </button>
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={() => {
                navigate("/user/created/communities");
              }}
              className={
                "flex justify-between text-sm items-center text-indigo-500 font-light bg-indigo-50 px-4 py-1 rounded-full"
              }
            >
              Created communites
            </button>
            <button
              onClick={() => {
                navigate("/user/joined/communities");
              }}
              className={
                "flex justify-between text-sm items-center text-indigo-500 font-light bg-indigo-50 px-4 py-1 rounded-full"
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
                  "flex justify-between text-sm items-center text-white font-light bg-indigo-500 px-4 py-1 rounded-full"
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
                  "flex justify-between text-sm items-center text-white font-light bg-indigo-500 px-4 py-1 rounded-full"
                }
              >
                <AddIcon sx={{ fontSize: 20 }} />
                <p>Community</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};