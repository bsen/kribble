import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { LoadingPage } from "../LoadingPage";
import { EditProfile } from "./EditProfile";
import { useParams } from "react-router-dom";
export const ProfileSection: React.FC = () => {
  const [loadingState, setLoadingState] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    image: string;
    bio: string;
    website: string;
    interest: string;
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
    interest: "",
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
      console.log(userData.name, userData.bio, userData.interest);
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

  return (
    <>
      {loadingState ? (
        <LoadingPage />
      ) : (
        <>
          {profileEditingState ? (
            <div className="absolute w-full lg:w-[45%]">
              <EditProfile />
            </div>
          ) : (
            ""
          )}
          <>
            <div className="px-5 py-2">
              <div className="flex justify-between items-center">
                <div>
                  <img
                    src={userData.image ? userData.image : "/user.png"}
                    alt="Profile"
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-full"
                  />
                </div>
                {currentUser === username ? (
                  <button
                    onClick={() => {
                      setProfileEditingState(true);
                    }}
                  >
                    <div className="text-primarytextcolor text-sm font-ubuntu border border-primarytextcolor hover:bg-neutral-50 rounded-full py-1 px-4">
                      profile settings
                    </div>
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={followUser}
                      className="bg-blue-600 text-background px-4 py-1 rounded-lg font-ubuntu"
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
                <div className="text-lg lg:text-xl font-semibold text-primarytextcolor">
                  {userData.name}
                </div>
                <div className="text-sm text-secondarytextcolor font-light">
                  @{userData.username}
                </div>

                <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                  Bio · {userData.bio}
                </div>
                <div className="">
                  <div className="text-sm text-secondarytextcolor font-light hover:underline">
                    <a href={userData.website ? userData.website : ""}>
                      {userData.website ? userData.website : ""}
                    </a>
                  </div>
                  <div className="text-sm lg:text-base text-secondarytextcolor font-light">
                    Interest · {userData.interest ? userData.interest : ""}
                  </div>
                </div>
                <div className="flex gap-4 my-2">
                  <div className="flex gap-2 items-center">
                    <div className="text-primarytextcolor">
                      {userData.followers.length}
                    </div>
                    <div className="text-secondarytextcolor">Followers</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-primarytextcolor">
                      {userData.following.length}
                    </div>
                    <div className="text-secondarytextcolor">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </>
      )}
    </>
  );
};
