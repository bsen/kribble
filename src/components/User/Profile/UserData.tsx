import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";
import { BACKEND_URL } from "../../../config";
import { UserContext } from "../Context/UserContext";
import { FollowersComponent } from "../Follow/FollowersComponent";
import { FollowingComponent } from "../Follow/FollowingComponent";
import { CommunitiesComponent } from "../Communities/CommunitiesComponent";
import LinearProgress from "@mui/material/LinearProgress";
import { CircularProgress } from "@mui/material";

interface UserData {
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
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showCommunities, setShowCommunities] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFollowUserLoading, setIsFollowUserLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    username: "",
    image: "",
    bio: "",
    website: "",
    followersCount: "",
    followingCount: "",
  });

  const getUserData = useCallback(async () => {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/profile/data`,
        { token, username }
      );
      if (!response.data.userdata) {
        setError(new Error("Profile not found"));
      } else {
        setUserData(response.data.userdata);
        setIsFollowing(response.data.following);
      }
      setLoadingState(false);
    } catch (error: any) {
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

  const navigateToEditProfile = useCallback(() => {
    navigate("/edit/profile", { state: { userData } });
  }, [navigate, userData]);

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-normal">
        {error.message}
      </div>
    );
  }
  if (loadingState) {
    return <LinearProgress sx={{ backgroundColor: "black" }} />;
  }
  return (
    <>
      {showFollowers && (
        <FollowersComponent closeComponent={() => setShowFollowers(false)} />
      )}
      {showFollowing && (
        <FollowingComponent closeComponent={() => setShowFollowing(false)} />
      )}
      {showCommunities && (
        <CommunitiesComponent
          closeComponent={() => setShowCommunities(false)}
        />
      )}

      <div className="mt-3 p-3 rounded-lg border border-semidark bg-dark">
        <div className="flex w-full justify-center items-center gap-2">
          <img
            src={userData.image ? userData.image : "/user.png"}
            className="lg:w-20 lg:h-20 w-16 rounded-lg border border-semidark"
          />

          <div className="w-full">
            <div className="flex items-center justify-end">
              <div>
                {token && (
                  <div>
                    {currentUser === username && (
                      <button
                        onClick={navigateToEditProfile}
                        className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                      >
                        Edit
                      </button>
                    )}
                    {currentUser !== username && (
                      <div className="flex my-2 gap-4 justify-between items-center">
                        <button
                          onClick={followUser}
                          disabled={isFollowUserLoading}
                          className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                        >
                          {isFollowUserLoading ? (
                            <CircularProgress
                              size="15px"
                              className="my-0.5"
                              sx={{ color: "rgb(200 200 200);" }}
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
                )}
                {!token && (
                  <button
                    onClick={() => {
                      navigate("/signup");
                    }}
                    className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>

            <div className="text-base font-normal text-light">
              {userData.username}
            </div>
            <div className="flex text-semilight font-ubuntu items-center gap-2 font-light text-sm">
              <button onClick={() => setShowFollowers(true)}>
                <div className="flex gap-1 items-center">
                  {userData.followersCount} Followers
                </div>
              </button>
              {currentUser === username && (
                <button onClick={() => setShowFollowing(true)}>
                  <div className="flex gap-1 items-center">
                    {userData.followingCount} Following
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-sm text-semilight font-ubuntu font-light">
            {userData.bio ? userData.bio : ""}
          </div>

          <div className="text-sm text-indigomain font-light font-ubuntu hover:underline">
            {userData.website && (
              <a
                href={userData.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {userData.website}
                <OpenInNewIcon sx={{ fontSize: 15 }} />
              </a>
            )}
          </div>
        </div>
      </div>
      <div>
        {currentUser === username && (
          <div className="px-2 flex gap-2  rounded-lg mt-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                navigate("/create/post");
              }}
              className="text-xs text-semilight flex items-center gap-1 font-light bg-indigomain px-3 py-1 rounded-lg"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              <span>Post</span>
            </button>
            <button
              onClick={() => {
                navigate("/hidden/posts");
              }}
              className="text-xs text-semilight font-light bg-indigomain px-3 py-1 rounded-lg"
            >
              Hidden&nbsp;posts
            </button>
            <button
              onClick={() => {
                navigate("/comments");
              }}
              className="text-xs text-semilight font-light bg-indigomain px-3 py-1 rounded-lg"
            >
              Comments
            </button>{" "}
            <button
              onClick={() => {
                setShowCommunities(true);
              }}
              className="text-xs text-semilight flex items-center gap-1 font-light bg-indigomain px-3 py-1 rounded-lg"
            >
              Communities
            </button>
            <button
              onClick={() => {
                navigate("/create/community");
              }}
              className="text-xs text-semilight flex items-center gap-1 font-light bg-indigomain px-3 py-1 rounded-lg"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              <span>Community</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
