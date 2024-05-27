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

interface UserData {
  fullname: string;
  username: string;
  image: string;
  bio: string;
  website: string;
  college: string;
  interest: string;
  followersCount: string;
  followingCount: string;
  weeklyPoints: string;
  totalPoints: string;
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
  const [isFollowUserLoading, setIsFollowUserLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    fullname: "",
    username: "",
    image: "",
    bio: "",
    website: "",
    college: "",
    interest: "",
    followersCount: "",
    followingCount: "",
    weeklyPoints: "",
    totalPoints: "",
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
      <div className="text-center my-10 text-red-500 font-normal">
        An error occurred: {error.message}
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
      <div className="mt-4 p-3 flex justify-evenly items-center rounded-lg bg-indigomain  text-left text-light text-sm">
        <div className="flex flex-col items-center justify-center">
          <div>{userData.weeklyPoints}</div> <div>Weekly points</div>
        </div>
        <img src="/medal.png" className="h-12 w-12 rounded-lg" />
        <div className="flex flex-col items-center justify-center">
          <div>{userData.totalPoints}</div> <div>Total points</div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg border border-semidark bg-dark">
        <div className="flex w-full justify-center items-center gap-2">
          <img
            src={userData.image ? userData.image : "/user.png"}
            className="lg:w-20 lg:h-20 w-16 rounded-lg border border-semidark"
          />

          <div className="w-full">
            <div className="flex items-center justify-end">
              <div>
                {currentUser === username && (
                  <button
                    onClick={() => {
                      navigate("/edit/profile");
                    }}
                    className="text-left text-semilight bg-indigomain font-light rounded-lg px-4 py-1 text-sm"
                  >
                    Edit
                  </button>
                )}
                {currentUser !== username && (
                  <div className="flex my-2 gap-4 justify-between items-center">
                    <button
                      onClick={followUser}
                      disabled={isFollowUserLoading}
                      className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-1 text-sm"
                    >
                      {isFollowUserLoading ? (
                        <div>··········</div>
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
              <div className="text-lg font-normal text-light">
                {userData.username}
              </div>
              <div className="text-xs text-semilight font-light font-ubuntu">
                {userData.fullname}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex text-semilight font-ubuntu items-center gap-2 font-light text-sm">
            <button onClick={() => setShowFollowers(true)}>
              <div className="flex gap-1 items-center">
                {userData.followersCount} Followers
              </div>
            </button>

            <button onClick={() => setShowFollowing(true)}>
              <div className="flex gap-1 items-center">
                {userData.followingCount} Following
              </div>
            </button>
          </div>
          <div className="text-sm text-semilight font-ubuntu font-light">
            {userData.bio ? userData.bio : ""}
          </div>
          <div className="text-sm text-semilight font-ubuntu font-light">
            {userData.college ? userData.college : ""}
          </div>
          <div className="text-sm text-semilight font-ubuntu font-light">
            {userData.interest ? userData.interest : ""}
          </div>

          <div className="text-sm text-indigomain font-light font-ubuntu hover:underline">
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

            <button
              onClick={() => {
                setShowCommunities(true);
              }}
              className="text-xs text-semilight flex items-center gap-1 font-light bg-indigomain px-3 py-1 rounded-lg"
            >
              Communities
            </button>
          </div>
        )}
      </div>
    </>
  );
};