import React, { useEffect, useState } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import { BACKEND_URL } from "../config";

export const Profilepage: React.FC = () => {
  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    username: string;
    email: string;
    gender: string;
    bio: string;
    image: string;
    posts: {
      id: string;
      content: string;
      image: string;
    }[];
  }>({
    id: "",
    name: "",
    username: "",
    email: "",
    gender: "",
    bio: "",
    image: "",
    posts: [],
  });

  const [bio, setBio] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [isBioEditing, setIsBioEditing] = useState(false);
  const token = localStorage.getItem("token");

  async function getData() {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token }
      );
      const { id, name, email, username, gender, bio, image, posts } =
        res.data.message;
      localStorage.setItem("userFromLocalStorage", username);

      setUserData({
        id,
        name,
        username,
        email,
        gender,
        bio,
        image,
        posts,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function bioUpdate() {
    if (bio.length == 0) {
      alert("enter a valid bio");
      return;
    }
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/bioupdate`,
        { token, bio }
      );
      console.log(res.data.status, res.data.message);
      if (res.data.status == 200) {
        setIsBioEditing(false);
        alert("Bio updated successfully");
      }
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

    const res = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/profile-picture-update`,
      formdata
    );
    if (res.data.status === 200) {
      setPreviewImage("");
      setProfileImg(null);
      return alert("Image updated");
    } else {
      return alert("Server error, try again later");
    }
  };
  const cancelSave = () => {
    setProfileImg(null);
    setPreviewImage("");
  };
  useEffect(() => {
    try {
      getData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);
  useEffect(() => {}, [userData.posts, userData.bio]);

  return (
    <div className="bg-black">
      <div className="p-10 border-b border-bordercolor">
        <div className="flex items-center justify-between">
          <div className="flex">
            {profileImg ? (
              <img
                src={previewImage}
                alt="Profile"
                className="w-20 h-20 rounded-full border border-bordercolor"
              />
            ) : (
              <img
                src={userData.image ? userData.image : "src/assets/user.png"}
                alt="Profile"
                className="w-20 h-20 rounded-full border border-bordercolor"
              />
            )}
            <div>
              <label htmlFor="image-upload" className="cursor-pointer ">
                <EditIcon sx={{ fontSize: 20 }} className="text-gray-400" />
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
                <div>0</div>
                <div>Followers</div>
              </div>
              <div className="flex flex-col items-center">
                <div>0</div>
                <div>Following</div>
              </div>
            </div>
          </div>
        </div>
        <div className="my-2">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg text-white">{userData.name}</h2>
              <h2 className="text-base text-gray-400 font-light">
                @{userData.username}
              </h2>
            </div>
            <div>
              {previewImage ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={savePhoto}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-1 rounded-lg font-light"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelSave}
                    className="bg-black border border-bordercolor hover:bg-gray-900 text-white px-4 py-1 rounded-lg font-light"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => setIsBioEditing(!isBioEditing)}
                    className="font-light hover:bg-black border border-gray-600 text-white px-4 py-1 rounded-lg "
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
                maxLength={200}
                defaultValue={userData.bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter your bio"
                className="w-full p-2  rounded-lg"
              />
              <button
                onClick={bioUpdate}
                className="bg-white hover:bg-gray-50 font-light text-gray-600 border border-gray-300 px-4 py-1 rounded-lg"
              >
                update
              </button>
            </div>
          )}
          {!isBioEditing && (
            <div className="text-white my-2 font-light">
              {userData.bio ? <p>{userData.bio}</p> : <p>Write your bio</p>}
            </div>
          )}
        </div>
      </div>

      <div className="">
        {userData.posts.length > 0 ? (
          userData.posts
            .slice()
            .reverse()
            .map((post, index) => (
              <div
                key={index}
                className="py-4 p-10  border-b border-bordercolor"
              >
                <div className="flex gap-2 items-center">
                  {userData.image ? (
                    <img
                      src={userData.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <img
                      src={"src/assets/chicken.png"}
                      alt="Profile"
                      className="w-10 h-10 border border-bordercolor rounded-full"
                    />
                  )}
                  <div className="flex gap-2 items-center">
                    <p className="text-white">{userData.name}</p>
                    <p className="text-gray-400 text-sm">
                      @{userData.username}
                    </p>
                  </div>
                </div>
                <div className="w-ful py-4 flex flex-col items-start justify-center">
                  <img
                    src={post.image}
                    className="h-auto max-w-[50%] rounded-lg"
                  />
                  <p className="text-white my-2 font-light">{post.content}</p>
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
  );
};
