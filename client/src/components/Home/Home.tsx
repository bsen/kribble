import { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../../config";
import { UserContext } from "../User/Context/UserContext";
import { MenuBar } from "../Menu/MenuBar";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import {
  FavoriteOutlined,
  FavoriteBorderOutlined,
  ChatBubbleOutlineOutlined,
  FullscreenOutlined,
  CloseOutlined,
  SendOutlined,
  MoreHorizOutlined,
  DeleteOutlined,
} from "@mui/icons-material";

interface Post {
  id: string;
  creator: {
    username: string;
    image: string | null;
  };
  caption: string | null;
  image: string | null;
  video: string | null;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
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
  const location = useLocation();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    null,
  );
  const commentScrollRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useContext(UserContext);
  const [commentText, setCommentText] = useState("");
  const [deleteState, setDeleteState] = useState(false);
  const [commentDeleteId, setCommentDeleteId] = useState<string | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);

  async function getFeedPosts(cursor?: string) {
    if (postData.posts.length > 0 && !cursor) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/feed/posts/home`,
        {
          token,
          cursor,
        },
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
    if (scrollContainerRef.current) {
      const newScrollPosition = scrollContainerRef.current.scrollTop;
      setScrollPosition(newScrollPosition);
      localStorage.setItem("homeScrollPosition", newScrollPosition.toString());
    }

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

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
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
            : post,
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
            : post,
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
        { token, postId, cursor },
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
    navigate(`/post/${post.id}`, {
      state: {
        scrollPosition,
        posts: postData.posts,
        nextCursor: postData.nextCursor,
      },
    });
  };
  useEffect(() => {
    const state = location.state as {
      scrollPosition?: number;
      posts?: Post[];
      nextCursor?: string | null;
    };

    if (state?.posts) {
      setPostData({
        posts: state.posts,
        nextCursor: state.nextCursor || null,
      });
    } else {
      getFeedPosts();
    }

    const restoreScroll = () => {
      const savedScrollPosition = localStorage.getItem("homeScrollPosition");
      if (savedScrollPosition && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = parseInt(
          savedScrollPosition,
          10,
        );
      }
    };

    restoreScroll();

    const timer = setTimeout(restoreScroll, 100);

    return () => clearTimeout(timer);
  }, [location.state]);

  useEffect(() => {
    if (postData.posts.length > 0) {
      const savedScrollPosition = localStorage.getItem("homeScrollPosition");
      if (savedScrollPosition && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = parseInt(
          savedScrollPosition,
          10,
        );
      }
    }
  }, [postData.posts]);

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
        },
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
            : comment,
        ),
      );

      const response = await axios.post(
        `${BACKEND_URL}/api/post/comment/like/unlike`,
        {
          token,
          commentId,
        },
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
              : comment,
          ),
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
            : comment,
        ),
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
        },
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
      { threshold: 0.5 },
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
      (now.getTime() - commentDate.getTime()) / 1000,
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gradient-to-br from-neutral-900 to-black min-h-screen text-white"
    >
      <MenuBar />
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="p-4 pb-20 h-[calc(100vh-56px)] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {postData.posts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-xl shadow-lg">
                {post.video ? (
                  <video
                    data-post-id={post.id}
                    src={post.video}
                    loop
                    playsInline
                    muted={true}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    controlsList="nodownload"
                  />
                ) : post.image ? (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <span className="text-neutral-400">No media</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-80 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Link
                    to={`/${post.creator.username}`}
                    className="text-sm font-semibold hover:underline text-white truncate max-w-[70%]"
                    title={post.creator.username}
                  >
                    {post.creator.username}
                  </Link>
                  <span className="text-xs text-neutral-300 truncate ml-1">
                    {getTimeDifference(post.createdAt)}
                  </span>
                </div>
                {post.caption && (
                  <p className="text-sm text-neutral-200 mb-1.5 line-clamp-2 break-words">
                    {post.caption}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Tooltip title={post.isLiked ? "Unlike" : "Like"}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          if (token) handleLike(post.id);
                          else navigate("/auth");
                        }}
                        size="small"
                      >
                        {post.isLiked ? (
                          <FavoriteOutlined
                            fontSize="small"
                            className="text-red-500"
                          />
                        ) : (
                          <FavoriteBorderOutlined
                            fontSize="small"
                            className="text-white"
                          />
                        )}
                      </IconButton>
                    </Tooltip>
                    <span className="text-sm">{post.likesCount}</span>
                    <Tooltip title="Comments">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComments(post);
                        }}
                        size="small"
                      >
                        <ChatBubbleOutlineOutlined
                          fontSize="small"
                          className="text-white"
                        />
                      </IconButton>
                    </Tooltip>
                    <span className="text-sm">{post.commentsCount}</span>
                  </div>
                  <Tooltip title="Fullscreen">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFullscreen(post);
                      }}
                      size="small"
                    >
                      <FullscreenOutlined
                        fontSize="small"
                        className="text-white"
                      />
                    </IconButton>
                  </Tooltip>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {postData.posts.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-10 text-neutral-400"
          >
            No posts available. Please refresh the page.
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center mt-5"
          >
            <CircularProgress size={30} sx={{ color: "white" }} />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 w-full max-w-md h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">Comments</h2>
                <IconButton onClick={() => setIsCommentsOpen(false)}>
                  <CloseOutlined className="text-neutral-400 hover:text-white" />
                </IconButton>
              </div>
              <div
                ref={commentScrollRef}
                onScroll={handleCommentScroll}
                className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900"
              >
                {comments.map((comment, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="p-4 border-b border-neutral-800 last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={comment.creator.image || "/user.png"}
                        alt={comment.creator.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <span className="font-semibold mr-2 text-white">
                              {comment.creator.username}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {getTimeDifference(comment.createdAt)}
                            </span>
                          </div>
                          {currentUser === comment.creator.username && (
                            <IconButton
                              onClick={() => {
                                setDeleteState(true);
                                setCommentDeleteId(comment.id);
                              }}
                              size="small"
                            >
                              <MoreHorizOutlined
                                fontSize="small"
                                className="text-neutral-400 hover:text-white"
                              />
                            </IconButton>
                          )}
                        </div>
                        <p className="text-sm text-neutral-300">
                          {comment.comment}
                        </p>
                        <div className="flex items-center mt-2">
                          <IconButton
                            onClick={() => handleLikeComment(comment.id)}
                            size="small"
                          >
                            {comment.isLiked ? (
                              <FavoriteOutlined
                                fontSize="small"
                                className="text-red-500"
                              />
                            ) : (
                              <FavoriteBorderOutlined
                                fontSize="small"
                                className="text-neutral-400"
                              />
                            )}
                          </IconButton>
                          <span className="text-xs text-neutral-400 ml-1">
                            {comment.likesCount} likes
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoadingComments && (
                  <div className="flex justify-center items-center mt-5">
                    <CircularProgress size={24} sx={{ color: "inherit" }} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-neutral-700">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createComment(selectedPost?.id || "");
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      maxLength={500}
                      className="flex-1 bg-neutral-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                      disabled={isPostingComment}
                    />
                    <IconButton
                      type="submit"
                      disabled={!commentText.trim() || isPostingComment}
                      className="bg-blue-500 text-white p-2 rounded-full disabled:opacity-50"
                    >
                      {isPostingComment ? (
                        <CircularProgress size={24} sx={{ color: "inherit" }} />
                      ) : (
                        <SendOutlined className="text-white" />
                      )}
                    </IconButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-800 rounded-lg overflow-hidden w-64 shadow-xl"
            >
              <button
                onClick={() => {
                  if (commentDeleteId) {
                    deleteComment(commentDeleteId);
                  }
                  setDeleteState(false);
                  setCommentDeleteId(null);
                }}
                className="w-full py-3 text-red-500 hover:bg-neutral-700 flex items-center justify-center space-x-2"
              >
                <DeleteOutlined fontSize="small" />
                <span>Delete Comment</span>
              </button>
              <button
                onClick={() => {
                  setDeleteState(false);
                  setCommentDeleteId(null);
                }}
                className="w-full py-3 text-white hover:bg-neutral-700"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
