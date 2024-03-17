import React, { useEffect, useState } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";

export const Profilepage: React.FC = () => {
  const api = "http://localhost:8787/api/server/v1/user";
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
      content: string /* add other properties if exist */;
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

  const [image, setImage] = useState("");
  const [isBioEditing, setIsBioEditing] = useState(false);

  const maxBioLength = 100;
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
      const res = await axios.post(`${api}/bioupdate`, { token, bio });
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
    <div className="border-l border-r border-gray-200 bg-white">
      <div className="p-10 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex">
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="w-20 h-20 rounded-full mr-4"
              />
            ) : (
              <img
                src={"src/assets/chicken.png"}
                alt="Profile"
                className="w-20 h-20 rounded-full border border-greay-50"
              />
            )}
            <div>
              <label htmlFor="image-upload" className="cursor-pointer ">
                <EditIcon sx={{ fontSize: 20 }} className="text-gray-700 " />
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
        </div>
        <div className="my-2">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg text-gray-700 font-semibold">
                {userData.name}
              </h2>
              <h2 className="text-base font-light">@{userData.username}</h2>
            </div>
            <div>
              {image ? (
                <div className="flex items-center">
                  <button
                    onClick={savePhoto}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1 rounded-lg mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelSave}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-1 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => setIsBioEditing(!isBioEditing)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1 rounded-lg "
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
                maxLength={maxBioLength}
                defaultValue={userData.bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter your bio"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={bioUpdate}
                className="bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-300 px-4 py-1 rounded-lg"
              >
                update
              </button>
            </div>
          )}
          {!isBioEditing && (
            <div className="text-gray-600 mt-2">
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
                className="bg-white  py-2 px-4  border-b border-gray-300 hover:bg-gray-50"
              >
                <div className="flex gap-2 items-start">
                  <div>
                    {image ? (
                      <img
                        src={image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <img
                        src={"src/assets/chicken.png"}
                        alt="Profile"
                        className="w-8 h-8 border border-indigo-500 rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex gap-2 items-center">
                      <p className="text-gray-800 font-semibold">
                        {userData.name}
                      </p>
                      <p className="text-gray-700 text-sm">
                        @{userData.username}
                      </p>
                    </div>

                    <p className="text-gray-700 my-1">{post.content}</p>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
};
