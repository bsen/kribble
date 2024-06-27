import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import NotesIcon from "@mui/icons-material/Notes";
import { BottomBar } from "../Bars/BottomBar";
import { NavBar } from "../Bars/NavBar";
import AddIcon from "@mui/icons-material/Add";
import { CircularProgress } from "@mui/material";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
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
  content: string;
  video: string | null;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  anonymity: string;
  isLiked: boolean;
}

export const TvComponent = () => {
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
        `${BACKEND_URL}/api/user/feed/posts/tv`,
        {
          token,
          cursor,
        }
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
    getFeedPosts();
  }, []);

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
  const handleVideoVisibility = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting) {
        video
          .play()
          .catch((error) => console.log("Auto-play was prevented:", error));
      } else {
        video.pause();
      }
    });
  };

  useEffect(() => {
    const options = {
      root: scrollContainerRef.current,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(handleVideoVisibility, options);

    postData.posts.forEach((post) => {
      if (post.video) {
        const videoElement = document.getElementById(`video-${post.id}`);
        if (videoElement) observer.observe(videoElement);
      }
    });

    return () => {
      postData.posts.forEach((post) => {
        if (post.video) {
          const videoElement = document.getElementById(`video-${post.id}`);
          if (videoElement) observer.unobserve(videoElement);
        }
      });
    };
  }, [postData.posts]);

  const handleScroll = () => {
    postData.posts.forEach((post) => {
      if (post.video) {
        const videoElement = document.getElementById(
          `video-${post.id}`
        ) as HTMLVideoElement | null;
        if (videoElement) videoElement.pause();
      }
    });

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

  return (
    <>
      <div
        className="h-screen overflow-y-auto no-scrollbar py-12"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
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
                <div className="w-full bg-black flex justify-center">
                  <video
                    id={`video-${post.id}`}
                    controls
                    className="h-[80vh]"
                    loop
                    playsInline
                    preload="metadata"
                  >
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : null}

              {post.content && (
                <div className="text-light my-2 px-3 font-ubuntu font-light text-base">
                  {post.content}
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
                        <AddReactionIcon
                          sx={{
                            fontSize: 22,
                          }}
                          className="text-yellow-400"
                        />
                      </div>
                    ) : (
                      <div>
                        <AddReactionOutlinedIcon
                          sx={{
                            fontSize: 22,
                          }}
                          className="text-light hover:text-yellow-400"
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
              </div>
            </div>
          ))
        ) : (
          <div>
            {!isLoading && (
              <div className="text-semilight my-5 font-light text-center text-lg">
                No posts found
              </div>
            )}
          </div>
        )}
        {isLoading && (
          <div className="w-full my-5 flex justify-center items-center">
            <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
          </div>
        )}
        <div
          onClick={() => {
            navigate("/create/post");
          }}
          className="absolute bg-indigomain bottom-20 right-4 lg:hidden flex justify-center items-center w-11 h-11 rounded-full"
        >
          <AddIcon className="text-light" sx={{ fontSize: 28 }} />
        </div>
        <BottomBar />
      </div>
    </>
  );
};
