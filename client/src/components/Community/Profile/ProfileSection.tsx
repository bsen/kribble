import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { CircularProgress } from "@mui/material";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Loading } from "../../Loading";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";
import { Data } from "./Data";
interface CommunityData {
  id: string;
}
interface Post {
  id: string;
  creator: {
    id: string;
    username: string;
    image: string | null;
  };
  community: {
    name: string;
    image: string | null;
  };
  content: string;
  image: string;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  anonymity: string;
  isLiked: boolean;
}
export const ProfileSection: React.FC = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [isCreator, setIsCreator] = useState(Boolean);
  const [communityPostDeletionState, setCommunityPostDeletionState] =
    useState(false);
  const [deletingPostId, setDeletingPostId] = useState("");

  const [communityData, setCommunityData] = useState<CommunityData>({
    id: "",
  });
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  const getCommunityData = async () => {
    try {
      setLoadingState(true);
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/profile/data`,
        { token, name }
      );
      setLoadingState(false);
      setCommunityData(response.data.data);
      setIsCreator(response.data.creator);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCommunityData();
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getAllPosts(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/post/all/posts`,
        { token, cursor, name }
      );
      setPostData({
        posts: [...postData.posts, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getAllPosts();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      postData.nextCursor &&
      !isLoading
    ) {
      getAllPosts(postData.nextCursor);
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
      await axios.post(`${BACKEND_URL}/api/post/like/like/unlike`, details);
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
  const deleteCommunityPost = async () => {
    setLoadingState(true);
    const id = communityData.id;
    await axios.post(`${BACKEND_URL}/api/community/post/delete`, {
      token,
      id,
      deletingPostId,
    });
    setDeletingPostId("");
    setCommunityPostDeletionState(false);
    setLoadingState(false);
    window.location.reload();
  };

  const getTimeDifference = (createdAt: string) => {
    const currentDate = new Date();
    const postDate = new Date(createdAt);
    const timeDifference = currentDate.getTime() - postDate.getTime();
    const hoursDifference = Math.floor(timeDifference / (1000 * 3600));
    const daysDifference = Math.floor(hoursDifference / 24);
    if (daysDifference >= 30) {
      return postDate.toDateString();
    } else if (daysDifference >= 1) {
      return `${daysDifference}d ago`;
    } else if (hoursDifference >= 1) {
      return `${hoursDifference}h ago`;
    } else {
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));
      return `${minutesDifference}m ago`;
    }
  };
  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div className="h-screen flex flex-col">
          {communityPostDeletionState ? (
            <div className="w-full bg-white border-l border-r border-neutral-100 h-screen flex justify-center items-center">
              <div className="flex flex-col gap-4 text-base  items-center font-ubuntu font-semibold">
                Do you really want to delete the post
                <div className="text-xs font-light text-neutral-600">
                  note you can not get back the deleted item!
                </div>
                <div className="flex gap-5">
                  <button
                    onClick={deleteCommunityPost}
                    className="text-white bg-red-500 hover:bg-red-400 font-semibold px-4 py-1  rounded-full"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setDeletingPostId("");
                      setCommunityPostDeletionState(false);
                    }}
                    className="text-black bg-white hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="h-screen overflow-y-auto no-scrollbar py-12"
              onScroll={handleScroll}
              ref={scrollContainerRef}
            >
              <NavBar />
              <Data />
              <div>
                {postData.posts.length > 0 ? (
                  postData.posts.map((post, index) => (
                    <div
                      key={index}
                      className="my-2 p-4 border border-neutral-100 rounded-md bg-white"
                    >
                      <div className="flex gap-2">
                        {post.anonymity ? (
                          <div>
                            <img
                              src={"/user.png"}
                              alt="unknown"
                              className="w-8 h-8 rounded-full"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              navigate(`/${post.creator.username}`);
                            }}
                          >
                            <img
                              src={
                                post.creator.image
                                  ? post.creator.image
                                  : "/user.png"
                              }
                              alt="Profile"
                              className="w-8 h-8 rounded-full"
                            />
                          </div>
                        )}

                        <div className="w-full flex flex-col">
                          <div className="w-full flex gap-2 justify-between items-center">
                            <div className="flex gap-2 items-center">
                              {post.anonymity ? (
                                <div className="text-primarytextcolor text-sm lg:text-base  font-semibold">
                                  {post.creator.username}
                                </div>
                              ) : (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/${post.creator.username}`);
                                  }}
                                  className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold"
                                >
                                  {post.creator.username}
                                </div>
                              )}
                              <div className="text-neutral-600 text-xs lg:text-sm font-ubuntu">
                                · {getTimeDifference(post.createdAt)}
                              </div>
                            </div>
                            {isCreator && (
                              <button
                                onClick={() => {
                                  setDeletingPostId(post.id);
                                  setCommunityPostDeletionState(true);
                                }}
                              >
                                <MoreVertIcon
                                  sx={{ fontSize: 20 }}
                                  className="text-neutral-600"
                                />
                              </button>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 py-4 w-full">
                            {post.image && (
                              <img
                                src={post.image ? post.image : ""}
                                className="max-w:w-[100%] lg:max-w-[50%] rounded-lg border border-neutral-100"
                              />
                            )}

                            <div className="text-primarytextcolor text-sm lg:text-base font-light">
                              {post.content}
                            </div>
                          </div>
                          <div className=" flex justify-between gap-2 items-center text-sm text-neutral-500">
                            <div className="flex gap-2 items-center">
                              <button
                                className="flex justify-center items-center gap-2 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(post.id);
                                }}
                              >
                                <div>
                                  {post.isLiked ? (
                                    <FavoriteIcon
                                      sx={{
                                        fontSize: 22,
                                      }}
                                      className="text-rose-500"
                                    />
                                  ) : (
                                    <FavoriteBorderIcon
                                      sx={{
                                        fontSize: 22,
                                      }}
                                      className="text-rose-500"
                                    />
                                  )}
                                </div>
                              </button>
                              <div className="text-sm text-neutral-600">
                                {post.likesCount} likes
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div onClick={() => navigate(`/post/${post.id}`)}>
                                <MapsUgcRoundedIcon
                                  sx={{ fontSize: 22 }}
                                  className="text-indigo-500 cursor-pointer"
                                />
                              </div>
                              <div className="text-sm text-neutral-600">
                                {post.commentsCount} comments
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center font-ubuntu my-5 text-neutral-800">
                    No posts found.
                  </div>
                )}
                {isLoading && (
                  <div className="text-center my-5">
                    <CircularProgress color="inherit" />
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="text-center my-5">
                  <CircularProgress color="inherit" />
                </div>
              )}
              <BottomBar />
            </div>
          )}
        </div>
      )}
    </>
  );
};
