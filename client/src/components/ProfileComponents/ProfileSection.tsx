import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import AddIcon from "@mui/icons-material/Add";
import { Loading } from "../Loading";
import { EditProfile } from "./EditProfile";
import { BACKEND_URL } from "../../config";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
  likesCount: string;
  commentsCount: string;
  isLiked: boolean;
}

export const ProfileSection: React.FC = () => {
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileEditingState, setProfileEditingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postDeleteId, setPostDeleteId] = useState("");
  const [deleteState, setDeleteState] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postsScrollContainerRef = useRef<HTMLDivElement>(null);
  const [isFollowUserLoading, setIsFollowUserLoading] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    image: string;
    bio: string;
    website: string;
    interest: string;
    followersCount: string;
    followingCount: string;
  }>({
    name: "",
    username: "",
    image: "",
    bio: "",
    website: "",
    interest: "",
    followersCount: "",
    followingCount: "",
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

  const getData = async () => {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/user-profile-data`,
        { token, username }
      );
      setUserData(response.data.message);
      setCurrentUser(response.data.currentUser);
      setIsFollowing(response.data.following);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllPosts = async (
    cursor: string | null | undefined,
    truncate: boolean
  ) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/user-all-posts`,
        { token, cursor, username }
      );
      setPostData((prevData) => ({
        posts: truncate
          ? [...response.data.posts]
          : [...prevData.posts, ...response.data.posts],
        nextCursor: response.data.nextCursor,
      }));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const handleScroll = () => {
    const postsScrollContainer = postsScrollContainerRef.current;
    if (
      postsScrollContainer &&
      postsScrollContainer.scrollTop + postsScrollContainer.clientHeight >=
        postsScrollContainer.scrollHeight &&
      postData.nextCursor &&
      !isLoading
    ) {
      getAllPosts(postData.nextCursor, false);
    }
  };
  const followUser = async () => {
    try {
      setIsFollowUserLoading(true);
      setIsFollowing((prevState) => !prevState);
      setUserData((prevData) => ({
        ...prevData,
        followersCount: isFollowing
          ? (parseInt(prevData.followersCount) - 1).toString()
          : (parseInt(prevData.followersCount) + 1).toString(),
      }));
      const details = { username, token };
      await axios.post(
        `${BACKEND_URL}/api/server/v1/user/follow-unfollow`,
        details
      );
    } catch (error) {
      console.log(error);
      setIsFollowing((prevState) => !prevState);
      setUserData((prevData) => ({
        ...prevData,
        followersCount: isFollowing
          ? (parseInt(prevData.followersCount) + 1).toString()
          : (parseInt(prevData.followersCount) - 1).toString(),
      }));
    } finally {
      setIsFollowUserLoading(false);
    }
  };
  const deletePost = async () => {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/server/v1/post/delete-post`, {
        token,
        postDeleteId,
      });
      setDeleteState(false);
      setPostDeleteId("");
      window.location.reload();
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      setPostData((prevData) => ({
        ...prevData,
        posts: prevData.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked
                  ? parseInt(post.likesCount) - 1
                  : parseInt(post.likesCount) + 1,
              }
            : post
        ) as Post[],
        nextCursor: prevData.nextCursor,
      }));

      const details = { postId, token };
      await axios.post(
        `${BACKEND_URL}/api/server/v1/post/post-like-unlike`,
        details
      );
    } catch (error) {
      console.log(error);

      setPostData((prevData) => ({
        ...prevData,
        posts: prevData.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked
                  ? parseInt(post.likesCount) + 1
                  : parseInt(post.likesCount) - 1,
              }
            : post
        ) as Post[],
        nextCursor: prevData.nextCursor,
      }));
    }
  };

  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div className="h-screen flex flex-col">
          {deleteState ? (
            <div className="w-full h-screen flex justify-center items-center">
              <div className="flex flex-col gap-4 text-base  items-center font-ubuntu font-semibold">
                Do you really want to delete the post
                <span className="text-xs font-light text-neutral-600">
                  note you can not get back the deleted item!
                </span>
                <div className="flex gap-5">
                  <button
                    onClick={deletePost}
                    className="text-white bg-red-500 hover:bg-red-400 font-semibold px-4 py-1  rounded-full"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setDeleteState(false);
                      setPostDeleteId("");
                    }}
                    className="text-black bg-stone-50 hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="overflow-y-auto no-scrollbar pt-5"
              onScroll={handleScroll}
              ref={scrollContainerRef}
            >
              {profileEditingState ? (
                <div className="absolute w-full lg:w-[45%]">
                  <EditProfile />
                </div>
              ) : (
                <div className="px-5 py-2 border-b border-neutral-200">
                  <div className="flex flex-col justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex w-full justify-between items-start gap-2">
                        <div className="w-full items-start justify-between flex gap-4 ">
                          <img
                            src={userData.image ? userData.image : "/user.png"}
                            alt="Profile"
                            className="w-20 h-20 lg:w-24 lg:h-24 rounded-full"
                          />
                          <div>
                            {currentUser === username ? (
                              <button
                                onClick={() => {
                                  setProfileEditingState(true);
                                }}
                                className="text-left text-white bg-primarytextcolor font-ubuntu rounded-full px-3 py-1 text-sm"
                              >
                                Edit profile
                              </button>
                            ) : (
                              <div className="flex my-2 gap-4 justify-between items-center">
                                <button
                                  onClick={followUser}
                                  disabled={isFollowUserLoading}
                                  className="text-background  py-1 text-sm rounded-full font-ubuntu bg-neutral-800 relative"
                                >
                                  <div className="flex items-center justify-center w-20 h-full">
                                    {isFollowUserLoading ? (
                                      <CircularProgress
                                        size="20px"
                                        className="text-sm"
                                        color="inherit"
                                      />
                                    ) : (
                                      <div>
                                        {isFollowing ? (
                                          <div>Unfollow</div>
                                        ) : (
                                          <div>Follow</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="text-base lg:text-xl font-semibold text-primarytextcolor">
                        {userData.name}
                      </div>
                      <div className="text-sm text-secondarytextcolor font-light">
                        @{userData.username}
                      </div>
                    </div>
                    <div className="flex  items-center gap-4 font-ubuntu text-sm">
                      <Link to={`/followers/${username}`}>
                        <div className="flex gap-2 items-center">
                          <div className="text-primarytextcolor">
                            {userData.followersCount}
                          </div>
                          <div className="text-secondarytextcolor">
                            Followers
                          </div>
                        </div>
                      </Link>
                      <Link to={`/following/${username}`}>
                        <div className="flex gap-2 items-center">
                          <div className="text-primarytextcolor">
                            {userData.followingCount}
                          </div>
                          <div className="text-secondarytextcolor">
                            Following
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="text-primarytextcolor  text-sm lg:text-base font-light">
                      {userData.bio ? userData.bio : "bio"}
                    </div>

                    <div className="text-sm text-indigo-500 font-light hover:underline">
                      <a
                        href={`${
                          userData.website &&
                          (userData.website.startsWith("http://") ||
                            userData.website.startsWith("https://"))
                            ? userData.website
                            : "https://" +
                              (userData.website
                                ? userData.website
                                : "www.kribble.net")
                        }`}
                        target="_blank"
                      >
                        {userData.website ? userData.website : "website"}{" "}
                        <OpenInNewIcon sx={{ fontSize: 15 }} />
                      </a>
                    </div>
                    <div className="text-sm text-secondarytextcolor font-light">
                      {userData.interest ? userData.interest : "interests"}
                    </div>
                  </div>
                  {currentUser == username ? (
                    <div className="flex my-2 flex-col items-start gap-2">
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => {
                            navigate("/create/post");
                          }}
                        >
                          <div
                            className={
                              "flex justify-between text-sm items-center text-primarytextcolor bg-neutral-100 px-4 py-1 rounded-full"
                            }
                          >
                            <AddIcon sx={{ fontSize: 20 }} />
                            <p>Post</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            navigate("/create/community");
                          }}
                        >
                          <div
                            className={
                              "flex justify-between text-sm items-center text-primarytextcolor bg-neutral-100 px-4 py-1 rounded-full"
                            }
                          >
                            <AddIcon sx={{ fontSize: 20 }} />
                            <p>Community</p>
                          </div>
                        </button>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => {
                            navigate("/comments");
                          }}
                          className={
                            "flex justify-between text-sm items-center text-primarytextcolor bg-neutral-100 px-4 py-1 rounded-full"
                          }
                        >
                          Comments
                        </button>
                        <button
                          onClick={() => {
                            navigate("/my-communities");
                          }}
                          className={
                            "flex justify-between text-sm items-center text-primarytextcolor bg-neutral-100 px-4 py-1 rounded-full"
                          }
                        >
                          My communites
                        </button>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              )}

              <div
                className="overflow-y-auto no-scrollbar touch-action-none"
                ref={postsScrollContainerRef}
              >
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
                          <div className="w-[90%]">
                            <div className="flex justify-between items-center">
                              <Link to={`/${post.creator.username}`}>
                                <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                                  {post.creator.name}
                                </div>
                              </Link>
                              {currentUser == username ? (
                                <button
                                  onClick={() => {
                                    setPostDeleteId(post.id);
                                    setDeleteState(true);
                                  }}
                                >
                                  <MoreVertIcon
                                    sx={{ fontSize: 20 }}
                                    className="text-neutral-600"
                                  />
                                </button>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="flex mb-2 gap-2 items-center">
                              <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                                @{post.creator.username}
                              </div>

                              <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                                · {post.createdAt.slice(0, 10)}
                              </div>
                            </div>
                            <div className="text-primarytextcolor mb-2 text-sm lg:text-base font-light">
                              {post.content}
                            </div>
                            {post.image && (
                              <img
                                src={post.image}
                                className="max-h-[80vh] mb-2 max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-neutral-200"
                              />
                            )}

                            <div className="flex  justify-start gap-5 items-center text-sm text-neutral-500">
                              <div
                                className="flex bg-rose-50 rounded-lg shadow-sm px-1 justify-center items-center gap-2 cursor-pointer"
                                onClick={() => handleLike(post.id)}
                              >
                                {post.isLiked ? (
                                  <FavoriteIcon
                                    sx={{
                                      fontSize: 18,
                                    }}
                                    className="text-rose-500"
                                  />
                                ) : (
                                  <FavoriteBorderIcon
                                    sx={{
                                      fontSize: 18,
                                    }}
                                    className="text-rose-500"
                                  />
                                )}

                                <div className="text-base text-rose-500">
                                  {post.likesCount}
                                </div>
                              </div>
                              <div className="flex bg-indigo-50 rounded-lg shadow-sm px-1 justify-center items-center gap-2 cursor-pointer">
                                <Link to={`/post/${post.id}`}>
                                  <ChatBubbleOutlineRoundedIcon
                                    sx={{ fontSize: 18 }}
                                    className="text-indigo-500"
                                  />
                                </Link>
                                <div className="text-base text-indigo-500">
                                  {post.commentsCount}
                                </div>
                              </div>
                            </div>
                          </div>
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
            </div>
          )}

          {isLoading && (
            <div className="text-center my-5">
              <CircularProgress color="inherit" />
            </div>
          )}
        </div>
      )}
    </>
  );
};
