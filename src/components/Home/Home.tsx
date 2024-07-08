import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { useContext } from "react";
import { UserContext } from "../User/Context/UserContext";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Button, TextField } from "@mui/material";
import {
  CircularProgress,
  Grid,
  Box,
  Typography,
  IconButton,
  Modal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MenuBar } from "../Menu/MenuBar";
import axios from "axios";

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
  anonymity: string;
  isLiked: boolean;
}

interface Comment {
  id: string;
  comment: string;
  createdAt: string;
  anonymity: boolean;
  likesCount: number;
  isLiked: boolean;
  creator: {
    username: string;
    image: string | null;
  };
}

export const Home = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [modalContent, setModalContent] = useState<{
    type: "image" | "video";
    src: string;
  } | null>(null);
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentNextCursor, setCommentNextCursor] = useState<string | null>(
    null
  );
  const commentScrollRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useContext(UserContext);
  const [commentText, setCommentText] = useState("");
  const [deleteState, setDeleteState] = useState(false);
  const [commentDeleteId, setCommentDeleteId] = useState<string | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);

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

  const getComments = async (postId: string, cursor?: string) => {
    setIsLoadingComments(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/post/comment/all/comments`,
        { token, postId, cursor }
      );
      if (response.data.status === 200) {
        if (cursor) {
          setComments((prevComments) => [
            ...prevComments,
            ...response.data.data,
          ]);
        } else {
          setComments(response.data.data);
        }
        setCommentNextCursor(response.data.nextCursor);
      } else {
        console.error("Failed to fetch comments:", response.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentScroll = () => {
    if (
      commentScrollRef.current &&
      commentScrollRef.current.scrollTop +
        commentScrollRef.current.clientHeight >=
        commentScrollRef.current.scrollHeight - 20 &&
      commentNextCursor &&
      !isLoadingComments &&
      selectedPost
    ) {
      getComments(selectedPost.id, commentNextCursor);
    }
  };

  const handleComments = async (post: Post) => {
    setSelectedPost(post);
    setIsCommentsOpen(true);
    setComments([]);
    setCommentNextCursor(null);
    await getComments(post.id);
  };

  const toggleFullscreen = (post: Post) => {
    if (post.video) {
      setModalContent({ type: "video", src: post.video });
    } else if (post.image) {
      setModalContent({ type: "image", src: post.image });
    }
  };

  const createComment = async (postId: string) => {
    if (!commentText.trim()) return;

    setIsPostingComment(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/post/comment/create`,
        {
          token,
          postId,
          comment: commentText,
        }
      );
      console.log(response.data);
      if (response.data.status === 200) {
        setCommentText("");
        await getComments(postId);
      } else {
        console.error("Failed to post comment:", response.data);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setCommentText("");
      setIsPostingComment(false);
    }
  };
  const handleLikeComment = async (commentId: string) => {
    try {
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likesCount: comment.isLiked
                  ? comment.likesCount - 1
                  : comment.likesCount + 1,
              }
            : comment
        )
      );

      const response = await axios.post(
        `${BACKEND_URL}/api/post/comment/like/unlike`,
        {
          token,
          commentId,
        }
      );

      if (response.data.status !== 200) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likesCount: comment.isLiked
                    ? comment.likesCount + 1
                    : comment.likesCount - 1,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error liking/unliking comment:", error);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likesCount: comment.isLiked
                  ? comment.likesCount + 1
                  : comment.likesCount - 1,
              }
            : comment
        )
      );
    }
  };
  const deleteComment = async (commentId: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/post/comment/delete`,
        {
          token,
          commentId,
        }
      );
      if (response.data.status === 200) {
        setComments(comments.filter((comment) => comment.id !== commentId));
      }
    } catch (error) {
      console.log(error);
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
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      observer.observe(video);
      video.muted = true;
    });

    return () => {
      videos.forEach((video) => observer.unobserve(video));
    };
  }, [postData.posts]);

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

  return (
    <>
      <MenuBar />
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          flexGrow: 1,
          padding: "4px",
          paddingBottom: 16,
          height: "calc(100vh - 56px)",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <Grid container spacing={2}>
          {postData.posts.map((post, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {post.video ? (
                  <div className="relative w-full aspect-square overflow-hidden">
                    <video
                      data-post-id={post.id}
                      src={post.video}
                      loop
                      playsInline
                      muted={true}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      controlsList="nodownload"
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        padding: 1,
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <Link
                          to={`/${post.creator.username}`}
                          style={{ textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            style={{
                              fontWeight: "light",
                              color: "white",
                              fontSize: "small",
                            }}
                          >
                            {post.creator.username}
                          </div>
                        </Link>
                        <div
                          style={{
                            fontWeight: "light",
                            color: "#8e8e8e",
                            fontSize: "small",
                          }}
                        >
                          {getTimeDifference(post.createdAt)}
                        </div>
                      </div>
                    </Box>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (token) {
                              handleLike(post.id);
                            } else {
                              navigate("/auth");
                            }
                          }}
                        >
                          {post.isLiked ? (
                            <img src="/liked.png" className="h-5" />
                          ) : (
                            <img src="/like.png" className="h-5" />
                          )}
                        </IconButton>
                        <Typography
                          variant="body2"
                          color="white"
                          sx={{ marginRight: 1 }}
                        >
                          {post.likesCount}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComments(post);
                          }}
                        >
                          <img src="/comment.png" className="h-5" />
                        </IconButton>
                        <Typography variant="body2" color="white">
                          {post.commentsCount}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFullscreen(post);
                        }}
                        size="small"
                      >
                        <img src="/fullscreen.png" className="h-5" />
                      </IconButton>
                    </Box>
                  </div>
                ) : post.image ? (
                  <Box sx={{ position: "relative" }}>
                    <img
                      src={post.image}
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        padding: 1,
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <Link
                          to={`/${post.creator.username}`}
                          style={{ textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            style={{
                              fontWeight: "light",
                              color: "white",
                              fontSize: "small",
                            }}
                          >
                            {post.creator.username}
                          </div>
                        </Link>
                        <div
                          style={{
                            fontWeight: "light",
                            color: "#8e8e8e",
                            fontSize: "small",
                          }}
                        >
                          {getTimeDifference(post.createdAt)}
                        </div>
                      </div>
                    </Box>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (token) {
                              handleLike(post.id);
                            } else {
                              navigate("/auth");
                            }
                          }}
                        >
                          {post.isLiked ? (
                            <img src="/liked.png" className="h-5" />
                          ) : (
                            <img src="/like.png" className="h-5" />
                          )}
                        </IconButton>
                        <Typography
                          variant="body2"
                          color="white"
                          sx={{ marginRight: 1 }}
                        >
                          {post.likesCount}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComments(post);
                          }}
                        >
                          <img src="/comment.png" className="h-5" />
                        </IconButton>
                        <Typography variant="body2" color="white">
                          {post.commentsCount}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFullscreen(post);
                        }}
                        size="small"
                      >
                        <img src="/fullscreen.png" className="h-5" />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No media
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 5 }}>
            <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
          </Box>
        )}
      </Box>
      <Modal
        open={modalContent !== null}
        onClose={() => setModalContent(null)}
        aria-labelledby="fullscreen-modal"
        aria-describedby="fullscreen-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "black",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={() => setModalContent(null)}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
          {modalContent?.type === "video" && (
            <video
              src={modalContent.src}
              autoPlay
              loop
              playsInline
              onClick={(e) => {
                const video = e.target as HTMLVideoElement;
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {modalContent?.type === "image" && (
            <img
              src={modalContent.src}
              alt="Fullscreen content"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
      </Modal>
      <Modal
        open={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        aria-labelledby="comments-modal"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "100%", sm: 400 },
            height: { xs: "100%", sm: "80vh" },
            bgcolor: "#121212",
            color: "white",
            borderRadius: { xs: 0, sm: 2 },
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              borderBottom: "1px solid #262626",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" component="h2">
              Comments
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setIsCommentsOpen(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            ref={commentScrollRef}
            onScroll={handleCommentScroll}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: 2,
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#121212",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "2px",
              },
            }}
          >
            {comments.map((comment, index) => (
              <Box
                key={index}
                sx={{
                  py: 1.5,
                  borderBottom: "1px solid #262626",
                  display: "flex",
                  gap: "6px",
                }}
              >
                <img
                  src={
                    comment.creator.image ? comment.creator.image : "/user.png"
                  }
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 0.5,
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", mr: 1 }}
                      >
                        {comment.creator.username}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#8e8e8e" }}>
                        {getTimeDifference(comment.createdAt)}
                      </Typography>
                    </Box>
                    {currentUser === comment.creator.username && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeleteState(true);
                          setCommentDeleteId(comment.id);
                        }}
                        sx={{ color: "white" }}
                      >
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "light", color: "#fafafa" }}
                  >
                    {comment.comment}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <IconButton
                      onClick={() => handleLikeComment(comment.id)}
                      size="small"
                      sx={{
                        color: comment.isLiked ? "error.main" : "inherit",
                        p: 0,
                        mr: 1,
                      }}
                    >
                      {comment.isLiked ? (
                        <img src="/liked.png" className="h-2.5" />
                      ) : (
                        <img src="/like.png" className="h-2.5" />
                      )}
                    </IconButton>
                    <Typography variant="caption" sx={{ color: "#8e8e8e" }}>
                      {comment.likesCount} likes
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
            {isLoadingComments && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress size={24} sx={{ color: "white" }} />
              </Box>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: "1px solid #262626" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              inputProps={{
                maxLength: 500,
              }}
              disabled={isPostingComment}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => createComment(selectedPost?.id || "")}
                    disabled={!commentText.trim() || isPostingComment}
                    sx={{
                      minWidth: 60,
                      textTransform: "none",
                    }}
                  >
                    {isPostingComment ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Post"
                    )}
                  </Button>
                ),
                sx: {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#262626",
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Modal>
      <Modal
        open={deleteState}
        onClose={() => {
          setDeleteState(false);
          setCommentDeleteId(null);
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "#262626",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            color: "white",
          }}
        >
          <Button
            fullWidth
            onClick={() => {
              if (commentDeleteId) {
                deleteComment(commentDeleteId);
              }
              setDeleteState(false);
              setCommentDeleteId(null);
            }}
            sx={{
              color: "error.main",
              py: 2,
              borderBottom: "1px solid #363636",
              borderRadius: "8px 8px 0 0",
              textTransform: "none",
            }}
          >
            Delete
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setDeleteState(false);
              setCommentDeleteId(null);
            }}
            sx={{
              color: "white",
              py: 2,
              borderRadius: "0 0 8px 8px",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
    </>
  );
};
