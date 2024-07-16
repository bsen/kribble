import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";

interface Post {
  id: string;
  creator: {
    username: string;
    image: string | null;
  };
  image: string | null;
  video: string | null;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  isLiked: boolean;
}

export const PostView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/post/${postId}`);
        if (response.data.status === 200) {
          setPost(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const getTimeDifference = (createdAt: string) => {
    const now = new Date();
    const commentDate = new Date(createdAt);
    const diffInSeconds = Math.floor(
      (now.getTime() - commentDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return commentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const togglePlayPause = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center mt-5">
          <CircularProgress size={24} sx={{ color: "white" }} />
        </div>
      ) : !post ? (
        <div className="flex justify-center items-center h-screen">
          <p className="text-white">Post not found</p>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black flex flex-col">
          <div className="absolute top-4 left-4 z-10">
            <div className="flex gap-2 items-center">
              <Link to={`/${post.creator.username}`} className="no-underline">
                <p className="text-sm text-neutral-400">
                  {post.creator.username}
                </p>
              </Link>
              <p className="text-sm text-neutral-400">
                {getTimeDifference(post.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 text-white z-10"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="w-full h-full flex items-center justify-center relative">
            {post.video ? (
              <video
                src={post.video}
                autoPlay
                loop
                playsInline
                muted={false}
                onClick={togglePlayPause}
                className="w-full h-full object-contain cursor-pointer"
              />
            ) : post.image ? (
              <img
                src={post.image}
                alt="Post content"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p className="text-white">No media available</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
