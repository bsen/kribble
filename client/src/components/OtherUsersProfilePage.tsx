import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { LoadingPage } from "./LoadingPage";
import { ButtonsSidebar } from "./ButtonsSidebar";
export const OtherUsersProfilePage = () => {
  const storageUser = localStorage.getItem("storageUser");
  const token = localStorage.getItem("token");
  const [followingState, setFollowingState] = useState();
  const [loadingState, setLoadingState] = useState(false);
  const { otherUser } = useParams();
  const navigate = useNavigate();
  const [otherUSerData, setOtherUSerData] = useState<{
    id: string;
    name: string;
    username: string;
    email: string;
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
    email: "",
    gender: "",
    bio: "",
    image: "",
    followers: [],
    following: [],
    posts: [],
  });
  const fetchotherUSerData = async () => {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/otheruser-data`,
        { otherUser, token }
      );
      setOtherUSerData(response.data.message);
      setFollowingState(response.data.following);
      setLoadingState(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  async function followUser() {
    setLoadingState(true);
    try {
      const details = { otherUser, token };
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/follow-unfollow`,
        details
      );
      if (response.data.status == 200) {
        await fetchotherUSerData();
      }
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchotherUSerData();
  }, [otherUser]);

  useEffect(() => {
    if (storageUser == otherUser) {
      navigate("/profile");
    }
  }, [navigate, otherUser]);

  if (Object.keys(otherUSerData).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {loadingState ? (
        <LoadingPage />
      ) : (
        <>
          <div className="h-14 lg:hidden top-0 fixed w-full flex items-center justify-center bg-black  border-b border-r border-l border-bordercolor text-2xl text-white font-ubuntu">
            kribble
          </div>
          <div className="lg:h-screen max-lg:my-14 border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
            <div className="p-10 border-b border-bordercolor">
              <div className="flex items-center justify-between">
                <img
                  src={otherUSerData.image ? otherUSerData.image : "/user.png"}
                  alt="Profile"
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full"
                />

                <div className="text-white flex  w-full justify-evenly">
                  <div className="flex flex-col items-center">
                    <div>{otherUSerData.posts.length}</div>
                    <div>Posts</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div>{otherUSerData.followers.length}</div>
                    <div>Followers</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div>{otherUSerData.following.length}</div>
                    <div>Following</div>
                  </div>
                </div>
              </div>
              <div className="my-2">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-lg text-white font-semibold">
                      {otherUSerData.name}
                    </h2>

                    <h2 className="text-base font-light text-neutral-400">
                      @{otherUSerData.username}
                    </h2>
                  </div>
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
                </div>
                <div className="text-white mt-2">
                  {otherUSerData.bio ? (
                    <div>{otherUSerData.bio}</div>
                  ) : (
                    <div>I am a Kribbler</div>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              {otherUSerData.posts.length > 0 ? (
                otherUSerData.posts
                  .slice()
                  .reverse()
                  .map((post, index) => (
                    <div
                      key={index}
                      className="py-4 p-10 border-b border-bordercolor"
                    >
                      <div className="flex gap-2 items-center">
                        <img
                          src={
                            otherUSerData.image
                              ? otherUSerData.image
                              : "/user.png"
                          }
                          alt="Profile"
                          className="w-10 h-10 rounded-full"
                        />

                        <div className="flex gap-2 items-center">
                          <div className="text-white font-semibold">
                            {otherUSerData.name}
                          </div>
                          <div className="text-neutral-400 text-sm">
                            @{otherUSerData.username}
                          </div>
                        </div>
                      </div>
                      <div className="w-full py-4 flex flex-col items-start justify-center">
                        <img
                          src={post.image}
                          className="h-auto w-[70%] rounded-lg"
                        />
                        <div className="text-white my-2">{post.content}</div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center font-ubuntu my-5 text-white">
                  No posts found.
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <div className="lg:hidden bg-neutral-950 bottom-0 fixed w-full border-l border-r border-t border-bordercolor">
        <div className="h-14">
          <ButtonsSidebar />
        </div>
      </div>
    </>
  );
};
