// pages/UserProfilePage.js
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const OtherUsersProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
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
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/user/get_third_person_data`,
          { username }
        );
        setUserData(response.data.message);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [username]);
  console.log(userData.posts);
  useEffect(() => {
    const user = localStorage.getItem("userFromLocalStorage");
    if (user == username) {
      navigate("/profile");
    }
  }, [navigate, username]);

  if (Object.keys(userData).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-black">
      <div className="p-10 border-b border-bordercolor">
        <div className="flex items-center justify-between">
          <img
            src={userData.image ? userData.image : "src/assets/user.png"}
            alt="Profile"
            className="h-20 w-20 rounded-full border border-bordercolor"
          />

          <div className="text-white flex w-full justify-evenly ">
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
              <h2 className="text-lg text-white font-semibold">
                {userData.name}
              </h2>
              <h2 className="text-base font-light text-gray-400">
                @{userData.username}
              </h2>
            </div>
            <div>
              <button className="bg-white hover:bg-gray-50 font-light text-gray-600 border border-gray-300 px-4 py-1 rounded-lg">
                Follow
              </button>
            </div>
          </div>
          <div className="text-white mt-2">
            {userData.bio ? <p>{userData.bio}</p> : <p>Write your bio</p>}
          </div>
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
                className="py-4 p-10 border-b border-bordercolor"
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
                    <p className="text-white font-semibold">{userData.name}</p>
                    <p className="text-gray-400 text-sm">
                      @{userData.username}
                    </p>
                  </div>
                </div>
                <div className="w-full py-4 flex flex-col items-start justify-center">
                  <img
                    src={post.image}
                    className="h-auto max-w-[50%] rounded-lg"
                  />
                  <p className="text-white my-2">{post.content}</p>
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
