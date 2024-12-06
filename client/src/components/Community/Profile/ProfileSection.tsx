import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import { CircularProgress, LinearProgress } from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

interface CommunityData {
  id: string;
  name: string;
  image: string;
  description: string;
  membersCount: string;
  postsCount: string;
}
interface Post {
  id: string;
  creator: {
    id: string;
    username: string;
    image: string | null;
  };
  taggedUser: {
    id: string;
    username: string;
    image: string;
  };
  caption: string;
  image: string;
  video: string | null;
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
  const [profileLoading, setProfileLoading] = useState(false);
  const [isCreator, setIsCreator] = useState(Boolean);
  const [deleteState, setDeleteState] = useState(false);
  const [postDeleteId, setPostDeleteId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isJoiningLoading, setIsJoiningLoading] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityData>({
    id: "",
    name: "",
    image: "",
    description: "",
    membersCount: "",
    postsCount: "",
  });
  const getCommunityData = async () => {
    try {
      setProfileLoading(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/community/profile/data`,
        { token, name }
      );
      if (!response.data.data) {
        setError(new Error("Community not found"));
      } else {
        setCommunityData(response.data.data);
        setIsCreator(response.data.creator);
        setIsJoined(response.data.joined);
      }
      setProfileLoading(false);
    } catch (error: any) {
      setError(error as Error);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    getCommunityData();
  }, []);

  const handleJoinCommunity = async () => {
    try {
      setIsJoiningLoading(true);
      setIsJoined((prevState) => !prevState);
      setCommunityData((prevData) => ({
        ...prevData,
        membersCount: isJoined
          ? (parseInt(prevData.membersCount) - 1).toString()
          : (parseInt(prevData.membersCount) + 1).toString(),
      }));

      const details = { token, name };
      await axios.post(`${BACKEND_URL}/api/community/join/join/leave`, details);
    } catch (error) {
      setError(error as Error);
      setIsJoined((prevState) => !prevState);
      setCommunityData((prevData) => ({
        ...prevData,
        membersCount: isJoined
          ? (parseInt(prevData.membersCount) + 1).toString()
          : (parseInt(prevData.membersCount) - 1).toString(),
      }));
    } finally {
      setIsJoiningLoading(false);
    }
  };

  const navigateToEditCommunity = useCallback(() => {
    navigate(`/edit/community/${communityData.name}`, {
      state: { communityData },
    });
  }, [navigate, communityData]);

  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getAllPosts(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/post/all/posts`, {
        token,
        cursor,
        communityName: name,
      });
      setPostData({
        posts: [...postData.posts, ...response.data.posts],
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
    setIsLoading(true);
    setDeleteState(false);
    const communityId = communityData.id;
    await axios.post(`${BACKEND_URL}/api/post/delete`, {
      token,
      communityId,
      postDeleteId,
    });
    setPostDeleteId("");
    setDeleteState(false);
    setIsLoading(false);
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
      getAllPosts(postData.nextCursor);
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

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-normal">
        {error.message}
      </div>
    );
  }
  if (deleteState) {
    return (
      <div className="w-full bg-black h-screen flex justify-center items-center">
        <div className="flex text-light text-center flex-col gap-6 text-base items-center font-ubuntu font-normal">
          Do you really want to delete the post ?
          <br />
          Note that you can not get back the deleted post
          <div className="flex gap-5">
            <button
              onClick={deleteCommunityPost}
              className="text-light bg-red-500 font-normal px-4 py-1 text-sm rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setDeleteState(false);
                setPostDeleteId("");
              }}
              className="text-dark bg-stone-50 font-normal px-4 py-1 text-sm rounded-lg"
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
        className="h-screen overflow-y-auto no-scrollbar py-12 "
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        {profileLoading && <LinearProgress sx={{ backgroundColor: "black" }} />}
        {!profileLoading && (
          <div className="p-3 mt-2 rounded-lg border border-semidark bg-dark">
            <div className="flex justify-between w-full items-center gap-2">
              <img
                src={communityData.image ? communityData.image : "/group.png"}
                className="lg:w-20 lg:h-20 w-16 h-16 rounded-lg border border-semidark"
              />
              <div className="w-full">
                <div className="flex justify-end items-center">
                  {token && (
                    <div>
                      {isCreator && (
                        <button
                          onClick={navigateToEditCommunity}
                          className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                        >
                          Edit
                        </button>
                      )}

                      {!isCreator && (
                        <button
                          onClick={handleJoinCommunity}
                          disabled={isJoiningLoading}
                          className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                        >
                          <div className="flex items-center justify-center">
                            {isJoiningLoading ? (
                              <CircularProgress
                                size="15px"
                                className="my-0.5"
                                sx={{ color: "rgb(200 200 200);" }}
                              />
                            ) : (
                              <div>
                                {isJoined ? <div>Joined</div> : <div>Join</div>}
                              </div>
                            )}
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                  {!token && (
                    <button
                      onClick={() => {
                        navigate("/login");
                      }}
                      className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                    >
                      Join
                    </button>
                  )}
                </div>
                <div className="text-lg lg:text-xl font-normal text-light">
                  {communityData.name}
                </div>
                <div className="flex text-light items-center gap-2 font-light text-sm">
                  <div className="flex gap-1 items-center">
                    {communityData.membersCount} Members
                  </div>
                  <div className="flex gap-1 items-center">
                    {communityData.postsCount} Posts
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm my-2 text-light font-light">
              {communityData.description
                ? communityData.description
                : "description"}
            </div>

            <div
              className="w-fit flex justify-start items-center"
              onClick={() => {
                navigate(`/create/${communityData.name}`);
              }}
            >
              <div
                className={
                  "flex w-fit justify-between text-sm items-center text-semilight font-light bg-indigomain px-4 py-1 rounded-lg"
                }
              >
                <AddIcon sx={{ fontSize: 20 }} />
                <p>Post</p>
              </div>
            </div>
          </div>
        )}

        <div>
          {postData.posts.length > 0 ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-2 rounded-lg border border-semidark  bg-dark"
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
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
                    <div className="w-fit flex gap-2 items-center">
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
                      className="absolute bottom-2 right-2 bg-black/40 text-light h-7 w-7 flex justify-center items-center rounded-full"
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
                    {isCreator && (
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
                    )}
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
        </div>

        <BottomBar />
      </div>
    </>
  );
};
