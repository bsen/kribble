import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";
interface Post {
  id: string;
  creator: {
    id: string;
    username: string;
    image: string | null;
  };
  content: string;
  image: string;
  createdAt: string;
  likesCount: string;
  commentsCount: string;
  isLiked: boolean;
}

interface ProfileSectionProps {}

export const IncognitoPostsComponent: React.FC<ProfileSectionProps> = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postDeleteId, setPostDeleteId] = useState("");
  const [deleteState, setDeleteState] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postsScrollContainerRef = useRef<HTMLDivElement>(null);
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });

  const getAllPosts = useCallback(
    async (cursor: string | null | undefined, truncate: boolean) => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${BACKEND_URL}/api/user/post/all/hidden/posts`,
          { token, cursor }
        );
        setPostData((prevData) => ({
          posts: truncate
            ? [...response.data.posts]
            : [...prevData.posts, ...response.data.posts],
          nextCursor: response.data.nextCursor,
        }));
        setIsLoading(false);
      } catch (error) {
        setError(error as Error);
        setIsLoading(false);
      }
    },
    [token]
  );
  useEffect(() => {
    getAllPosts(null, true);
  }, [token]);

  const handleScroll = useCallback(() => {
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
  }, [getAllPosts, isLoading, postData.nextCursor]);

  const deletePost = useCallback(async () => {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/user/post/delete`, {
        token,
        postDeleteId,
      });
      setDeleteState(false);
      setPostDeleteId("");
      window.location.reload();
      setLoadingState(false);
    } catch (error) {
      setError(error as Error);
      setLoadingState(false);
    }
  }, [token, postDeleteId]);

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

  const getTimeDifference = useCallback((createdAt: string) => {
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
  }, []);

  if (deleteState) {
    return (
      <div className="w-full bg-bgmain h-screen flex justify-center items-center">
        <div className="flex text-textmain flex-col gap-4 text-base items-center font-ubuntu font-normal">
          Do you really want to delete the post ?
          <span className="text-xs font-light text-texttwo">
            note that you can not get back the deleted post
          </span>
          <div className="flex gap-5">
            <button
              onClick={deletePost}
              className="text-textmain bg-red-500 hover:bg-red-400 font-normal px-4 py-1 rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setDeleteState(false);
                setPostDeleteId("");
              }}
              className="text-black bg-stone-50 hover:bg-neutral-200 font-normal px-4 py-1 border border-neutral-300 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingState) {
    return (
      <div className="bg-bgmain w-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-normal">
        An error occurred: {error.message}
      </div>
    );
  }

  return (
    <>
      <div
        className="h-screen overflow-y-auto no-scrollbar py-12 md:py-0"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        <div
          className="overflow-y-auto no-scrollbar touch-action-none"
          ref={postsScrollContainerRef}
        >
          {postData.posts.length > 0 ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-3 p-3 rounded-lg border border-bordermain bg-bgmain"
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
                          post.creator.image ? post.creator.image : "/user.png"
                        }
                        alt="Profile"
                        className="w-9 h-9 rounded-lg"
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
                            className="text-textmain text-sm lg:text-base hover:underline font-normal"
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
                    <button
                      onClick={() => {
                        setPostDeleteId(post.id);
                        setDeleteState(true);
                      }}
                    >
                      <MoreVertIcon
                        className="text-texttwo"
                        sx={{ fontSize: 20 }}
                      />
                    </button>
                  </div>
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex flex-col gap-2 py-4 w-full">
                    {post.image && (
                      <img
                        src={post.image}
                        className="rounded-lg w-[100%] md:w-[60%]"
                      />
                    )}

                    <div className="text-textmain text-sm lg:text-base font-light">
                      {post.content}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2 items-center text-sm text-texttwo">
                    <button
                      className="bg-bordermain text-rosemain px-2   rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                    >
                      {post.isLiked ? (
                        <div>
                          <FavoriteIcon
                            sx={{
                              fontSize: 20,
                            }}
                            className="text-rosemain"
                          />
                        </div>
                      ) : (
                        <div>
                          <FavoriteBorderOutlinedIcon
                            sx={{
                              fontSize: 20,
                            }}
                            className="text-rosemain"
                          />
                        </div>
                      )}
                      {post.likesCount}
                    </button>

                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="bg-bordermain text-indigomain px-2   rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <ReplyIcon sx={{ fontSize: 22 }} />
                      {post.commentsCount}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-texttwo my-5  font-light text-center text-sm">
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
    </>
  );
};
