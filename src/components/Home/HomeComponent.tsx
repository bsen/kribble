import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import NotesIcon from "@mui/icons-material/Notes";
import { CircularProgress } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { NavBar } from "../Bars/NavBar";

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
  image: string | null;
  video: string | null;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  anonymity: string;
  isLiked: boolean;
}

export const HomeComponent = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });

  async function getFeedPosts(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/feed/posts/home`,
        {
          token,
          cursor,
        }
      );
      if (response.data.status === 200) {
        setPostData({
          posts: [...postData.posts, ...response.data.data],
          nextCursor: response.data.nextCursor,
        });
      } else if (response.data.status === 901) {
        localStorage.clear();
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getFeedPosts();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight - 100 &&
      postData.nextCursor &&
      !isLoading
    ) {
      getFeedPosts(postData.nextCursor);
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
              <div key={index} className="my-2 border-b border-semidark">
                <div className="py-4 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    {post.community ? (
                      <div>
                        {post.community && (
                          <div>
                            {post.community && (
                              <img
                                src={post.community.image || "/group.png"}
                                className="w-8 h-8 rounded-lg"
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
                            className="w-8 h-8 rounded-lg"
                          />
                        ) : (
                          <img
                            src={
                              post.creator.image
                                ? post.creator.image
                                : "/user.png"
                            }
                            alt="Profile"
                            className="w-8 h-8 rounded-lg"
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
                      className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
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
                  <img src={post.image} />
                ) : null}

                {post.caption && (
                  <div className="text-light my-2 font-ubuntu font-light text-base">
                    {post.caption}
                  </div>
                )}

                <div className="py-4 flex items-center justify-between">
                  <div className="flex gap-6 items-center">
                    <button
                      className="text-light flex justify-center items-center gap-2 cursor-pointer"
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
                      className="text-light flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <NotesIcon sx={{ fontSize: 24 }} />
                      {post.commentsCount}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              {!isLoading && (
                <div className="text-light my-5 font-light text-center text-xl">
                  Please refresh the page.
                </div>
              )}
            </div>
          )}
        </div>
        {isLoading && (
          <div className="w-full my-5 flex justify-center items-center">
            <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
          </div>
        )}
      </div>
    </>
  );
};
