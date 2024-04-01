import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { PostsUser } from "./ProfileComponents/PostsUser";
import { LoadingPage } from "./LoadingPage";
import { EditProfile } from "./ProfileComponents/EditProfile";
export const Profilepage: React.FC = () => {
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

  //const [deletingPost, setDeletingPost] = useState("");
  const [profileEditingState, setProfileEditingState] = useState(false);
  const token = localStorage.getItem("token");

  async function getData() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token }
      );
      setUserData(response.data.message);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  // async function deletePost() {
  //   const postId = deletingPost;
  //   setLoadingState(true);
  //   try {
  //     const response = await axios.post(
  //       `${BACKEND_URL}/api/server/v1/post/delete-post`,
  //       { token, postId }
  //     );
  //     setLoadingState(false);

  //     setDeletingPost("");
  //     if (response.data.status == 200) {
  //       alert("post deleted succesfull");
  //       getData();
  //     } else {
  //       alert("post deletion failed, try again later");
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  useEffect(() => {
    try {
      getData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);
  useEffect(() => {}, [userData.bio]);

  return (
    <>
      {loadingState ? (
        <LoadingPage />
      ) : (
        <>
          {profileEditingState ? (
            <div className="absolute w-[40%]">
              <EditProfile />
            </div>
          ) : (
            ""
          )}

          <div className="h-screen border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
            <div className="p-5 border-b border-bordercolor">
              <div className="flex justify-between items-center">
                <div>
                  <img
                    src={userData.image ? userData.image : "/user.png"}
                    alt="Profile"
                    className="w-16 h-16 lg:w-24 lg:h-24 rounded-full"
                  />
                </div>
                <button
                  onClick={() => {
                    setProfileEditingState(true);
                  }}
                >
                  <div className="text-white text-sm font-ubuntu border border-neutral-500 hover:bg-neutral-800 rounded-full py-1 px-4">
                    profile settings
                  </div>
                </button>
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
              </div>
            </div>
            <div className="absolute h-screen  bg-black/30"></div>
            <PostsUser />
          </div>
          {/* )} */}
        </>
      )}
    </>
  );
};
