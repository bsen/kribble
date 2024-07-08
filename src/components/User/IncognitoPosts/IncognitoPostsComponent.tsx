import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NotesIcon from "@mui/icons-material/Notes";
import { NavBar } from "../../Bars/NavBar";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

interface Post {
  id: string;
  creator: {
    username: string;
    image: string | null;
  };
  community: {
    name: string;
    image: string | null;
  };
  taggedUser: {
    id: string;
    username: string;
    image: string;
  };
  caption: string;
  image: string;
  video: string;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  anonymity: string;
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
          `${BACKEND_URL}/api/post/all/hidden/posts`,
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
      setDeleteState(false);
      setLoadingState(true);
      const res = await axios.post(`${BACKEND_URL}/api/post/delete`, {
        token,
        postDeleteId,
      });
      if (res.data.status === 200) {
        setPostDeleteId("");
        window.location.reload();
        setLoadingState(false);
      }
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

  const [mutedVideos, setMutedVideos] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            videoElement.play().catch((error) => {
              console.log("Autoplay was prevented:", error);
            });
            setMutedVideos((prev) => ({
              ...prev,
              [videoElement.dataset.postId as string]: true,
            }));
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    const videos = document.querySelectorAll("video");
    videos.forEach((video) => observer.observe(video));

    return () => {
      videos.forEach((video) => observer.unobserve(video));
    };
  }, [postData.posts]);

  const togglePlay = (postId: string) => {
    const videoElement = document.querySelector(
      `video[data-post-id="${postId}"]`
    ) as HTMLVideoElement;
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    }
  };

  if (deleteState) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="flex text-light flex-col gap-4 text-center text-sm items-center font-ubuntu font-normal">
          Do you really want to delete the post ?<br /> note that you can not
          get back the deleted post
          <div className="flex gap-5">
            <button
              onClick={deletePost}
              className="text-light bg-rosemain font-normal px-4 py-1 rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setDeleteState(false);
                setPostDeleteId("");
              }}
              className="text-dark bg-semilight font-normal px-4 py-1 border border-neutral-300 rounded-lg"
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
      <div className="w-full h-screen flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
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
      <NavBar />
      <div
        className="flex justify-center h-screen overflow-y-auto no-scrollbar py-14"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div className="w-full md:w-[35%] px-2">
          {postData.posts.length > 0 ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-2 rounded-lg border border-semidark  bg-dark"
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    {post.community ? (
                      <div>
                        {post.community && (
                          <div>
                            {post.community && (
                              <img
                                src={post.community.image || "/group.png"}
                                className="w-7 h-7 rounded-lg"
                                alt="Community"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {post.anonymity ? (
                          <img
                            src="/mask.png"
                            alt="Profile"
                            className="w-7 h-7 rounded-lg"
                          />
                        ) : (
                          <img
                            src={
                              post.creator.image
                                ? post.creator.image
                                : "/user.png"
                            }
                            alt="Profile"
                            className="w-7 h-7 rounded-lg"
                          />
                        )}
                      </div>
                    )}
                    <div className="w-fit flex gap-2 items-center">
                      {post.community ? (
                        <div>
                          <div className="flex gap-2 items-center">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/community/${post.community.name}`);
                              }}
                            >
                              {post.community && (
                                <div className="text-light text-sm lg:text-base hover:underline underline-offset-2 font-normal">
                                  c/ {post.community.name}
                                </div>
                              )}
                            </div>
                            <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                              · {getTimeDifference(post.createdAt)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2 items-center">
                            {post.anonymity ? (
                              <div className="text-light text-sm lg:text-base font-normal">
                                {post.creator.username}
                              </div>
                            ) : (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/${post.creator.username}`);
                                }}
                                className="text-light text-sm lg:text-base hover:underline underline-offset-2 font-normal"
                              >
                                {post.creator.username}
                              </div>
                            )}

                            <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                              · {getTimeDifference(post.createdAt)}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {post.taggedUser && (
                    <div className="">
                      <div
                        onClick={() => {
                          navigate(`/${post.taggedUser.username}`);
                        }}
                        className="text-light bg-semidark w-fit flex items-center gap-2 px-2 py-1 rounded-lg font-ubuntu text-xs"
                      >
                        <img
                          className="h-4 w-4 rounded-lg"
                          src={
                            post.taggedUser.image
                              ? post.taggedUser.image
                              : "/user.png"
                          }
                        />
                        {post.taggedUser.username}
                      </div>
                    </div>
                  )}
                </div>

                {post.video ? (
                  <div className="relative w-full aspect-square overflow-hidden">
                    <video
                      data-post-id={post.id}
                      src={post.video}
                      loop
                      playsInline
                      muted
                      className="absolute top-0 left-0 w-full h-full object-cover border border-semidark cursor-pointer"
                      onClick={() => togglePlay(post.id)}
                    />
                    <button
                      className="absolute bottom-2 right-2 bg-dark/40 text-light h-7 w-7 flex justify-center items-center rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        const video = document.querySelector(
                          `video[data-post-id="${post.id}"]`
                        ) as HTMLVideoElement;
                        if (video) {
                          video.muted = !video.muted;
                          setMutedVideos((prev) => ({
                            ...prev,
                            [post.id]: video.muted,
                          }));
                        }
                      }}
                    >
                      {mutedVideos[post.id] ? (
                        <VolumeOffIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <VolumeUpIcon sx={{ fontSize: 20 }} />
                      )}
                    </button>
                  </div>
                ) : post.image ? (
                  <img src={post.image} className="w-[100%]" />
                ) : null}

                {post.caption && (
                  <div className="text-light my-2 px-3 font-ubuntu font-light text-base">
                    {post.caption}
                  </div>
                )}

                <div className="p-3 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <button
                      className="bg-semidark  text-light px-2 rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        if (token) {
                          e.stopPropagation();
                          handleLike(post.id);
                        } else {
                          navigate("/auth");
                        }
                      }}
                    >
                      {post.isLiked ? (
                        <div>
                          <FavoriteIcon
                            sx={{
                              fontSize: 22,
                            }}
                            className="text-rosemain"
                          />
                        </div>
                      ) : (
                        <div>
                          <FavoriteBorderIcon
                            sx={{
                              fontSize: 22,
                            }}
                            className="text-light hover:text-rosemain"
                          />
                        </div>
                      )}
                      {post.likesCount}
                    </button>

                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="bg-semidark text-light px-2   rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <NotesIcon sx={{ fontSize: 24 }} />
                      {post.commentsCount}
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setPostDeleteId(post.id);
                        setDeleteState(true);
                      }}
                    >
                      <MoreVertIcon
                        className="text-semilight"
                        sx={{ fontSize: 20 }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              {isLoading ? (
                <div className="w-full my-5 flex justify-center items-center">
                  <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
                </div>
              ) : (
                <div className="text-semilight my-5 font-light text-center text-sm">
                  No posts found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
