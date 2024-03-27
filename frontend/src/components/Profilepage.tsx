import React, { useEffect, useState } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import { BACKEND_URL } from "../config";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import { CloseFullscreen } from "@mui/icons-material";
export const Profilepage: React.FC = () => {
  const [loadingState, setLoadingState] = useState(false);

  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    username: string;
    gender: string;
    bio: string;
    image: string;
    followers: {
      followerId: string;
      followingId: string;
    }[];
    following: {
      followerId: string;
      followingId: string;
    }[];
    posts: {
      id: string;
      content: string;
      image: string;
    }[];
  }>({
    id: "",
    name: "",
    username: "",
    gender: "",
    bio: "",
    image: "",
    followers: [],
    following: [],
    posts: [],
  });

  const [bio, setBio] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [postDeletionState, setPostDeletionState] = useState(false);
  const [deletingPost, setDeletingPost] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [isBioEditing, setIsBioEditing] = useState(false);
  const token = localStorage.getItem("token");

  async function getData() {
    setLoadingState(true);
    try {
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

  async function bioUpdate() {
    if (bio.length == 0) {
      alert("enter a valid bio");
      return;
    }
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/bioupdate`,
        { token, bio }
      );

      if (response.data.status == 200) {
        setIsBioEditing(false);
        getData();
        alert("Bio updated successfully");
      }
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setProfileImg(file);
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const savePhoto = async () => {
    const file = profileImg;
    const formdata = new FormData();
    formdata.append("image", file ? file : "");
    formdata.append("token", token ? token : "");
    setLoadingState(true);
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/profile-picture-update`,
      formdata
    );
    setLoadingState(false);

    if (response.data.status === 200) {
      setPreviewImage("");
      setProfileImg(null);
      getData();
      return alert("Image updated");
    } else {
      return alert("Server error, try again later");
    }
  };
  const cancelSave = () => {
    setProfileImg(null);
    setPreviewImage("");
  };

  async function deletePost() {
    const postId = deletingPost;
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/delete-post`,
        { token, postId }
      );
      setLoadingState(false);
      setPostDeletionState(false);
      setDeletingPost("");
      if (response.data.status == 200) {
        alert("post deleted succesfull");
        getData();
      } else {
        alert("post deletion failed, try again later");
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    try {
      getData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);
  useEffect(() => {}, [userData.posts, userData.bio]);

  return (
    <>
      {loadingState ? (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          {postDeletionState ? (
            <div className="bg-neutral-950 w-full h-screen flex items-center justify-center">
              <div className="text-white text-lg font-mono">
                Do you really want to delete this post?
                <div className="flex justify-evenly my-5">
                  <button
                    onClick={deletePost}
                    className="text-blue-500 px-4 py-1 border border-blue-500 rounded-lg font-thin"
                  >
                    YES
                  </button>
                  <button
                    onClick={() => {
                      setPostDeletionState(false);
                    }}
                    className="text-blue-500 px-5 py-1 border border-blue-500 rounded-lg font-thin"
                  >
                    NO
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-screen border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
              <div className="p-10 border-b border-bordercolor">
                <div className="flex justify-between items-center">
                  <div className=" flex w-[25%]">
                    {profileImg ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border border-neutral-800"
                      />
                    ) : (
                      <img
                        src={userData.image ? userData.image : "/user.png"}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border border-neutral-800"
                      />
                    )}
                    <div>
                      <label htmlFor="image-upload" className="cursor-pointer ">
                        <EditIcon
                          sx={{ fontSize: 20 }}
                          className="text-neutral-400"
                        />
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="text-white flex  w-full justify-evenly ">
                    <div className="text-white flex justify-evenly gap-10 ">
                      <div className="flex flex-col items-center">
                        <div>{userData.posts.length}</div>
                        <div>Posts</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div>{userData.followers.length}</div>
                        <div>Followers</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div>{userData.following.length}</div>
                        <div>Following</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="my-2 px-2">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-lg text-white">{userData.name}</h2>
                      <h2 className="text-base text-neutral-400 font-light">
                        @{userData.username}
                      </h2>
                    </div>
                    <div>
                      {previewImage ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={savePhoto}
                            className="bg-blue-500  text-white px-4 py-1 rounded-lg font-light"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelSave}
                            className="bg-black border border-bordercolor hover:bg-neutral-900 text-white px-4 py-1 rounded-lg font-light"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <button
                            onClick={() => setIsBioEditing(!isBioEditing)}
                            className="bg-blue-600 font-light text-white px-4 py-1 rounded-lg"
                          >
                            {isBioEditing ? "Cancel" : "Edit bio"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {isBioEditing && (
                    <div className="flex items-center w-full gap-4 my-2">
                      <input
                        maxLength={120}
                        defaultValue={userData.bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Enter your bio"
                        className="w-full p-2  rounded-lg"
                      />
                      <button
                        onClick={bioUpdate}
                        className="bg-black border border-bordercolor hover:bg-neutral-900 text-white px-4 py-1 rounded-lg font-light"
                      >
                        update
                      </button>
                    </div>
                  )}
                  {!isBioEditing && (
                    <div className="text-white my-2 font-light">
                      {userData.bio ? (
                        <p>{userData.bio}</p>
                      ) : (
                        <p>Write your bio</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                {userData.posts.length > 0 ? (
                  userData.posts
                    .slice()
                    .reverse()
                    .map((post, index) => (
                      <div
                        key={index}
                        className="py-4 p-10  border-b border-bordercolor"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={userData.image ? userData.image : "user.png"}
                              alt="Profile"
                              className="w-10 h-10 border border-neutral-800 rounded-full"
                            />

                            <div className="flex gap-2 items-center">
                              <p className="text-white">{userData.name}</p>
                              <p className="text-neutral-400 text-sm">
                                @{userData.username}
                              </p>
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setPostDeletionState(true);
                                setDeletingPost(post.id);
                              }}
                            >
                              <DeleteIcon
                                sx={{ fontSize: 20 }}
                                className="text-neutral-600"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="w-ful py-4 flex flex-col items-start justify-center">
                          <img
                            src={post.image}
                            className="h-auto w-[70%] rounded-lg"
                          />
                          <p className="text-white my-2 font-light">
                            {post.content}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center font-mono my-5 text-white">
                    No posts found.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
