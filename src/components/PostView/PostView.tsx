import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { BACKEND_URL } from "../../config";

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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Post not found</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bgcolor: "black",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 1 }}>
        <div className="flex gap-2 items-center">
          <Link
            to={`/${post.creator.username}`}
            style={{ textDecoration: "none" }}
          >
            <Typography variant="body2" color="#C8C8C8">
              {post.creator.username}
            </Typography>
          </Link>
          <Typography variant="body2" color="#C8C8C8">
            {getTimeDifference(post.createdAt)}
          </Typography>
        </div>
      </Box>
      <IconButton
        aria-label="close"
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          color: "white",
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {post.video ? (
          <video
            src={post.video}
            autoPlay
            loop
            playsInline
            muted={false}
            onClick={togglePlayPause}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              cursor: "pointer",
            }}
          />
        ) : post.image ? (
          <img
            src={post.image}
            alt="Post content"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <Typography variant="body1" color="white">
            No media available
          </Typography>
        )}
      </Box>
    </Box>
  );
};
