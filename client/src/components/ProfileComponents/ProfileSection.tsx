import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { LoadingPage } from "../LoadingPage";
import { EditProfile } from "./EditProfile";
import { useParams, Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BottomButtons } from "../Mobile/BottomButtons";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

interface Post {
  id: string;
  creator: {
    id: string;
    username: string;
    name: string;
    image: string | null;
  };
  content: string;
  image: string;
  createdAt: string;
  commentsCount: string;
}

export const ProfileSection: React.FC = () => {
  const [loadingState, setLoadingState] = useState(false);
  const [postDeleteId, setPostDeleteId] = useState("");
  const [postDeleteState, setPostDeleteState] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [profileEditingState, setProfileEditingState] = useState(false);
  const [followingState, setFollowingState] = useState();
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  useEffect(() => {
    getData();
    getAllPosts(null, true);
  }, [username]);
  async function getData() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token, username }
      );
      setUserData(response.data.message);
      setCurrentUser(response.data.currentUser);
      setFollowingState(response.data.following);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }
  async function getAllPosts(
    cursor: string | null | undefined,
    truncate: boolean
  ) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/posts`,
        { token, cursor, username }
      );
      setPostData({
        posts: truncate
          ? [...response.data.message]
          : [...postData.posts, ...response.data.message],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }
  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      postData.nextCursor &&
      !isLoading
    ) {
      getAllPosts(postData.nextCursor, false);
    }
  };

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
  async function deletePost() {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/server/v1/post/delete-post`, {
        token,
        postDeleteId,
      });
      setPostDeleteState(false);
      setPostDeleteId("");
      window.location.reload();
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
        <div className="h-screen flex flex-col">
          {postDeleteState ? (
            <div className="w-full h-screen flex justify-center items-center">
              <div className="flex flex-col gap-4 text-base  items-center font-ubuntu font-semibold">
                Do you really want to delete the post?
                <span className="text-xs font-light text-neutral-400">
                  note you can not get back the deleted posts!
                </span>
                <div className="flex gap-5">
                  <button
                    onClick={deletePost}
                    className="text-white bg-red-500 hover:bg-red-600 font-semibold px-4 py-1  rounded-full"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setPostDeleteState(false);
                      setPostDeleteId("");
                    }}
                    className="text-black bg-background hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto no-scrollbar max-lg:mb-14"
              onScroll={handleScroll}
              ref={scrollContainerRef}
            >
              {profileEditingState ? (
                <div className="absolute w-full lg:w-[45%]">
                  <EditProfile />
                </div>
              ) : (
                <div className="px-5 py-2 border-b border-neutral-200">
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
                        <div className="text-primarytextcolor text-sm font-ubuntu border border-secondarytextcolor hover:bg-neutral-50 rounded-full py-1 px-4">
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
                      {userData.bio ? userData.bio : "your bio"}
                    </div>
                    <div className="">
                      <div className="text-sm text-secondarytextcolor font-light hover:underline">
                        <a href={userData.website ? userData.website : ""}>
                          {userData.website ? userData.website : "your website"}
                        </a>
                      </div>
                      <div className="text-sm lg:text-base text-secondarytextcolor font-light">
                        {userData.interest
                          ? userData.interest
                          : "your interests"}
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
              )}

              <div>
                {postData.posts.length > 0 ? (
                  postData.posts.map((post, index) => (
                    <div
                      key={index}
                      className="border-b border-neutral-200 p-3"
                    >
                      <div>
                        <div className="flex gap-2">
                          <div>
                            <Link to={`/${post.creator.username}`}>
                              <img
                                src={
                                  post.creator.image
                                    ? post.creator.image
                                    : "/user.png"
                                }
                                alt="Profile"
                                className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                              />
                            </Link>
                          </div>
                          <div className="w-[80%]">
                            <div className="flex gap-2 items-center">
                              <Link to={`/${post.creator.username}`}>
                                <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                                  {post.creator.name}
                                </div>
                              </Link>
                              <Link to={`/${post.creator.username}`}>
                                <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                                  @{post.creator.username}
                                </div>
                              </Link>
                              <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                                · {post.createdAt.slice(0, 10)}
                              </div>
                              <div className="text-neutral-600">
                                <button
                                  onClick={() => {
                                    setPostDeleteState(true);
                                    setPostDeleteId(post.id);
                                  }}
                                >
                                  <MoreVertIcon />
                                </button>
                              </div>
                            </div>
                            <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                              {post.content}
                            </div>
                            <div>
                              <img
                                src={post.image}
                                className="max-h-[80vh] mt-2 max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-neutral-200"
                              />
                            </div>
                            <div>
                              <div className="flex gap-2 text-neutral-600"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end text-sm text-neutral-500">
                          <Link to={`/post/${post.id}`}>
                            <ChatBubbleOutlineRoundedIcon
                              sx={{ fontSize: 17 }}
                            />
                          </Link>
                          <div>{post.commentsCount}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center font-ubuntu my-5 text-primarytextcolor">
                    No posts found.
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="text-center my-5">
                  <CircularProgress />
                </div>
              )}
            </div>
          )}
          <BottomButtons />
        </div>
      )}
    </>
  );
};
