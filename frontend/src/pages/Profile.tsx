import React, { useEffect, useState } from "react";
import axios from "axios";

export const Profile: React.FC = () => {
  const api = "http://localhost:8787/api/server/v1/user";
  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    username: string;
    email: string;
    gender: string;
    bio: string;
    posts: {
      id: string;
      content: string /* add other properties if exist */;
    }[];
  }>({
    id: "",
    name: "",
    username: "",
    email: "",
    gender: "",
    bio: "",
    posts: [],
  });

  const [bio, setBio] = useState("");
  const [post, setPost] = useState("");
  const [image, setImage] = useState("");
  const [isBioEditing, setIsBioEditing] = useState(false);
  const [ispostEditing, setIspostEditing] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const maxBioLength = 100;
  const maxpostLength = 300;

  const handleLogout = async () => {
    // Implement logout functionality for the website
  };

  const token = localStorage.getItem("token");

  async function getData() {
    try {
      const res = await axios.post(`${api}/userdata`, { token });
      const { id, name, email, username, gender, bio, posts } =
        res.data.message;

      setUserData({
        id,
        name,
        username,
        email,
        gender,
        bio,
        posts,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function bioUpdate() {
    const res = await axios.post(`${api}/bioupdate`, { token, bio });
    console.log(res.data.status, res.data.message);
    if (res.data.status == 200) {
      setIsBioEditing(false);
      alert("Bio updated successfully");
    }
  }

  async function newPost() {
    if (post.length <= 0) {
      alert("Write a valid post");
      return;
    }
    console.log(post);
    const res = await axios.post(`${api}/post`, { token, post });
    if (res.data.status == 200) {
      setIspostEditing(false);
      alert("post posted successfully");
    }
  }

  async function handleLike(postId: string) {
    try {
      const username = userData.username;
      await axios.post(`${api}post/like`, {
        postId,
        username,
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const savePhoto = async () => {
    const username = userData.username;

    const res = await axios.post(`${api}`, { username, image });
    if (res.data.status === 200) {
      alert("Image updated");
    } else if (res.data.status === 403) {
      alert("Server error, try again later");
    } else {
      alert("Server error, try again later");
    }
    setImage("");
  };

  const cancelSave = () => {
    setImage("");
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
    <div className="flex justify-center">
      <div className="w-full max-w-3xl border border-gray-300 rounded-lg">
        <div className="bg-white rounded-t-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {image ? (
                <img
                  src={image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full mr-4"
                />
              ) : (
                <img
                  src={"src/assets/chicken.png"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full mr-4"
                />
              )}
              <div>
                <h2 className="text-lg font-bold">{userData.username}</h2>
                <div className="text-gray-500 flex items-center"></div>
              </div>
            </div>
            <div>
              {image ? (
                <div className="flex items-center">
                  <button
                    onClick={savePhoto}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelSave}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => setIsBioEditing(!isBioEditing)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
                  >
                    {isBioEditing ? "Cancel" : "Edit bio"}
                  </button>
                  <label
                    htmlFor="image-upload"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Upload Image
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            {isBioEditing && (
              <div className="flex items-center">
                <textarea
                  maxLength={maxBioLength}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter your bio"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={bioUpdate}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ml-2"
                >
                  Update Bio
                </button>
              </div>
            )}
            {!isBioEditing && (
              <div>
                {userData.bio ? <p>{userData.bio}</p> : <p>Write your bio</p>}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-b-lg p-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIspostEditing(!ispostEditing)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {ispostEditing ? "Cancel" : "Post"}
            </button>
          </div>
          {ispostEditing && (
            <div className="flex items-center mb-4">
              <textarea
                maxLength={maxpostLength}
                value={post}
                onChange={(e) => setPost(e.target.value)}
                placeholder="Write your post"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={newPost}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ml-2"
              >
                Post
              </button>
            </div>
          )}
          <div>
            {userData.posts.length > 0 ? (
              userData.posts
                .slice()
                .reverse()
                .map((post, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-lg p-4 mb-4 border border-gray-300"
                  >
                    <p className="text-gray-700 mb-2">{post.content}</p>
                    {/* Render other post information */}
                  </div>
                ))
            ) : (
              <p>No posts found.</p>
            )}
          </div>
        </div>
      </div>

      {isSetting && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-700 mb-4">Do you want to logout?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsSetting(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg mr-2"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
