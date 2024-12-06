import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { MessageSquare, Heart, Volume2, VolumeX, Plus } from "lucide-react";

interface Post {
  id: string;
  creator: {
    username: string;
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
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  const [mutedVideos, setMutedVideos] = useState<{ [key: string]: boolean }>(
    {}
  );

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
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      setPostData((prevData) => ({
        ...prevData,
        posts: prevData.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked
                  ? String(parseInt(post.likesCount) - 1)
                  : String(parseInt(post.likesCount) + 1),
              }
            : post
        ),
        nextCursor: prevData.nextCursor,
      }));

      await axios.post(`${BACKEND_URL}/api/post/like/like/unlike`, {
        postId,
        token,
      });
    } catch (error) {
      console.log(error);
      // Revert the optimistic update if the request fails
      setPostData((prevData) => ({
        ...prevData,
        posts: prevData.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked
                  ? String(parseInt(post.likesCount) - 1)
                  : String(parseInt(post.likesCount) + 1),
              }
            : post
        ),
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

  const toggleMute = (postId: string) => {
    const videoElement = document.querySelector(
      `video[data-post-id="${postId}"]`
    ) as HTMLVideoElement;
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      setMutedVideos((prev) => ({
        ...prev,
        [postId]: videoElement.muted,
      }));
    }
  };

  return (
    <div
      className="h-screen overflow-y-auto no-scrollbar py-12"
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {postData.posts.length > 0
          ? postData.posts.map((post, index) => (
              <div
                key={index}
                className="bg-neutral-900 rounded-xl overflow-hidden shadow-lg"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        post.anonymity
                          ? "/mask.png"
                          : post.creator.image || "/user.png"
                      }
                      alt="Profile"
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h3
                        onClick={() => navigate(`/${post.creator.username}`)}
                        className="text-white font-medium hover:underline cursor-pointer"
                      >
                        {post.creator.username}
                      </h3>
                      <p className="text-neutral-400 text-sm">
                        {getTimeDifference(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {post.taggedUser && (
                    <div
                      onClick={() => navigate(`/${post.taggedUser.username}`)}
                      className="px-3 py-2 bg-neutral-800 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <img
                        src={post.taggedUser.image || "/user.png"}
                        className="w-6 h-6 rounded-lg"
                        alt={post.taggedUser.username}
                      />
                      <span className="text-sm text-neutral-300">
                        {post.taggedUser.username}
                      </span>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                {post.video ? (
                  <div className="relative aspect-video">
                    <video
                      data-post-id={post.id}
                      src={post.video}
                      loop
                      playsInline
                      muted={mutedVideos[post.id]}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => togglePlay(post.id)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute(post.id);
                      }}
                      className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white 
                             hover:bg-black/70 transition-colors"
                    >
                      {mutedVideos[post.id] ? (
                        <VolumeX size={20} />
                      ) : (
                        <Volume2 size={20} />
                      )}
                    </button>
                  </div>
                ) : post.image ? (
                  <img src={post.image} className="w-full" alt="Post content" />
                ) : null}

                {post.caption && (
                  <p className="p-4 text-neutral-100">{post.caption}</p>
                )}

                {/* Post Actions */}
                <div className="p-4 flex items-center gap-4 border-t border-neutral-800">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-neutral-300 hover:text-pink-500 
                           transition-colors"
                  >
                    <Heart
                      size={20}
                      className={
                        post.isLiked ? "fill-pink-500 text-pink-500" : ""
                      }
                    />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="flex items-center gap-2 text-neutral-300 hover:text-blue-500 
                           transition-colors"
                  >
                    <MessageSquare size={20} />
                    <span>{post.commentsCount}</span>
                  </button>
                </div>
              </div>
            ))
          : !isLoading && (
              <div className="text-center text-neutral-400">
                Please refresh the page.
              </div>
            )}

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-neutral-600 border-t-neutral-200 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Mobile Create Post Button */}
      <button
        onClick={() => navigate("/create")}
        className="fixed bottom-20 right-4 lg:hidden p-4 bg-indigo-600 rounded-full shadow-lg
                 hover:bg-indigo-700 transition-colors"
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  );
};
