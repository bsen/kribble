import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { PostsUser } from "./PostsUser";
import { LoadingPage } from "../LoadingPage";
import { EditProfile } from "./EditProfile";
import { useParams } from "react-router-dom";
import { Matches } from "../MatchMaker/Matches";
export const ProfileSection: React.FC = () => {
  const [loadingState, setLoadingState] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    image: string;
    bio: string;
    website: string;
    relationstatus: string;
    followers: {
      followerId: string;
      followingId: string;
    }[];
    following: {
      followerId: string;
      followingId: string;
    }[];
  }>({
    name: "",
    username: "",
    image: "",
    bio: "",
    website: "",
    relationstatus: "",
    followers: [],
    following: [],
  });

  const [currentUser, setCurrentUser] = useState("");
  useEffect(() => {
    User();
  }, []);
  async function User() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/user`,
        { token }
      );
      setCurrentUser(response.data.message.username);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }
  const [profileEditingState, setProfileEditingState] = useState(false);
  const token = localStorage.getItem("token");
  const { username } = useParams();
  async function getData() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token, username }
      );
      setUserData(response.data.message);
      setFollowingState(response.data.following);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    try {
      getData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [username]);
  const [followingState, setFollowingState] = useState();

  async function followUser() {
    setLoadingState(true);
    try {
      const details = { username, token };
      await axios.post(
        `${BACKEND_URL}/api/server/v1/user/follow-unfollow`,
        details
      );

      await getData();
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  const [comp, setComp] = useState(true);

  return (
    <>
      {loadingState ? (
        <LoadingPage />
      ) : (
        <>
          {profileEditingState ? (
            <div className="absolute w-full lg:w-[40%]">
              <EditProfile />
            </div>
          ) : (
            ""
          )}

          <div className="h-screen overflow-y-auto no-scrollbar">
            <div className="px-5 py-2 border-b border-neutral-800">
              <div className="flex justify-between items-center">
                <div>
                  <img
                    src={userData.image ? userData.image : "/user.png"}
                    alt="Profile"
                    className="w-16 h-16 lg:w-24 lg:h-24 rounded-full"
                  />
                </div>
                {currentUser === username ? (
                  <button
                    onClick={() => {
                      setProfileEditingState(true);
                    }}
                  >
                    <div className="text-white text-sm font-ubuntu border border-neutral-500 hover:bg-neutral-800 rounded-full py-1 px-4">
                      profile settings
                    </div>
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={followUser}
                      className="bg-blue-800 text-neutral-300 px-4 py-1 rounded-lg font-ubuntu"
                    >
                      <div>
                        {followingState ? (
                          <div>Unfollow</div>
                        ) : (
                          <div>Follow</div>
                        )}
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <div className="my-2">
                <div className="text-xl font-semibold text-white">
                  {userData.name}
                </div>
                <div className="text-sm text-neutral-400 font-light">
                  @{userData.username}
                </div>

                <div className="text-white my-2 text-base font-light">
                  {userData.bio ? (
                    <div>{userData.bio}</div>
                  ) : (
                    <div>write your bio</div>
                  )}
                </div>
                <div className="">
                  <div className="text-sm text-neutral-400 font-light hover:underline">
                    <a href={userData.website ? userData.website : ""}>
                      {userData.website ? userData.website : ""}
                    </a>
                  </div>
                  <div className="text-base text-neutral-200 font-light">
                    relationship status ·{" "}
                    {userData.relationstatus ? userData.relationstatus : ""}
                  </div>
                </div>
                <div className="flex gap-4 my-2">
                  <div className="flex gap-2 items-center">
                    <div className="text-white">
                      {userData.followers.length}
                    </div>
                    <div className="text-neutral-400">Followers</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-white">
                      {userData.following.length}
                    </div>
                    <div className="text-neutral-400">Following</div>
                  </div>
                </div>
                <div className="flex gap-5">
                  <button
                    onClick={() => {
                      setComp(true);
                    }}
                  >
                    <div className="text-blue-500 text-base font-ubuntu font-semibold underline underline-offset-2">
                      Posts
                    </div>
                  </button>
                  {currentUser === username ? (
                    <button
                      onClick={() => {
                        setComp(false);
                      }}
                    >
                      <div className="text-pink-500 text-base font-ubuntu font-semibold underline underline-offset-2">
                        Matches
                      </div>
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            {comp ? (
              <PostsUser />
            ) : (
              <div>
                {currentUser === username ? <Matches /> : "" + setComp(true)}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
