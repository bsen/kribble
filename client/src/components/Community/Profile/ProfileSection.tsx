import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { CircularProgress } from "@mui/material";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";
import { CommunityData } from "./CommunityData";
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
  const [error, setError] = useState<Error | null>(null);
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
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/profile/data`,
        { token, name }
      );
      setCommunityData(response.data.data);
      setIsCreator(response.data.creator);
      setIsLoading(false);
    } catch (error) {
      setError(error as Error);
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
      setError(error as Error);
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

  const handleLike = useCallback(
    async (postId: string) => {
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
        setError(error as Error);

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
    },
    [token]
  );

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

  if (loadingState) {
    return (
      <div className="h-screen bg-bgmain w-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-semibold">
        An error occurred: {error.message}
      </div>
    );
  }
  if (communityPostDeletionState) {
    return (
      <div className="w-full bg-bgmain border-l border-r border-bordermain h-screen flex justify-center items-center">
        <div className="flex flex-col gap-4 text-base  items-center font-ubuntu font-semibold">
          Do you really want to delete the post
          <div className="text-xs font-light text-texttwo">
            note you can not get back the deleted item!
          </div>
          <div className="flex gap-5">
            <button
              onClick={deleteCommunityPost}
              className="text-textmain bg-red-500 hover:bg-red-400 font-semibold px-4 py-1  rounded-full"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setDeletingPostId("");
                setCommunityPostDeletionState(false);
              }}
              className="text-black bg-bgmain hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div
        className="h-screen p-2 flex justify-center overflow-y-auto no-scrollbar py-12 md:py-0"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        <div className="w-[100%] md:w-[60%]">
          <CommunityData />
          <div>
            {postData.posts &&
              postData.posts.map((post, index) => (
                <div
                  key={index}
                  className="my-4 p-2 py-4 rounded-md border border-bordermain  bg-bgmain"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
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
                          className="w-9 h-9 rounded-full"
                        />
                      </div>

                      <div className="w-fit flex gap-2 items-center">
                        <>
                          <div className="flex gap-2 items-center">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/${post.creator.username}`);
                              }}
                              className="text-textmain text-sm lg:text-base hover:underline font-semibold"
                            >
                              {post.creator.username}
                            </div>

                            <div className="text-texttwo text-xs lg:text-sm font-ubuntu">
                              · {getTimeDifference(post.createdAt)}
                            </div>
                          </div>
                        </>
                      </div>
                    </div>
                    <div>
                      {isCreator && (
                        <button
                          onClick={() => {
                            setDeletingPostId(post.id);
                            setCommunityPostDeletionState(true);
                          }}
                        >
                          <MoreVertIcon
                            className="text-texttwo"
                            sx={{ fontSize: 20 }}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full flex flex-col">
                    <div className="flex flex-col gap-2 py-4 w-full">
                      {post.image && (
                        <img src={post.image} className="rounded-md" />
                      )}

                      <div className="text-textmain text-sm lg:text-base font-light">
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
                                className="text-rose-600"
                              />
                            ) : (
                              <FavoriteIcon
                                sx={{
                                  fontSize: 22,
                                }}
                                className="text-neutral-400"
                              />
                            )}
                          </div>
                        </button>
                        <div className="text-sm text-texttwo">
                          {post.likesCount} likes
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div onClick={() => navigate(`/post/${post.id}`)}>
                          <MapsUgcRoundedIcon
                            sx={{ fontSize: 22 }}
                            className="text-texttwo cursor-pointer"
                          />
                        </div>
                        <div className="text-sm text-neutral-400">
                          {post.commentsCount} comments
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {!postData.posts && (
              <div className="text-texttwo my-5  font-light text-center text-lg">
                No posts found
              </div>
            )}
          </div>
          <div>
            {isLoading && (
              <div className="w-full my-5 flex justify-center items-center">
                <CircularProgress />
              </div>
            )}
          </div>
        </div>
        <BottomBar />
      </div>
    </>
  );
};
