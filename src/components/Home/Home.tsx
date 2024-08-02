import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { useContext } from "react";
import { UserContext } from "../User/Context/UserContext";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import { MenuBar } from "../Menu/MenuBar";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";

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
    null
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
          10
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
          10
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
      <div className="bg-black min-h-screen text-white">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="max-w-xl mx-auto pt-2 pb-16 px-2 h-screen overflow-y-auto no-scrollbar"
        >
          {postData.posts.map((post, index) => (
            <div
              key={index}
              className="bg-dark mb-6 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={post.creator.image || "/user.png"}
                    alt={post.creator.username}
                    className="w-7 h-7 rounded-full mr-3 object-cover"
                  />
                  <Link
                    to={`/${post.creator.username}`}
                    className="font-semibold text-sm text-white hover:underline"
                  >
                    {post.creator.username}
                  </Link>
                </div>
                <p className="text-xs text-gray-400">
                  {getTimeDifference(post.createdAt)}
                </p>
              </div>

              <div className="w-full flex justify-center bg-dark">
                {post.video ? (
                  <video
                    src={post.video}
                    loop
                    playsInline
                    muted={false}
                    className="w-full max-h-[70vh] object-contain"
                    controlsList="nodownload"
                  />
                ) : post.image ? (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center">
                    <span className="text-gray-400">No media</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (token) handleLike(post.id);
                        else navigate("/auth");
                      }}
                      className="flex items-center space-x-2 transition"
                    >
                      {post.isLiked ? (
                        <FaHeart className="w-6 h-6 text-rosemain" />
                      ) : (
                        <FaRegHeart className="w-6 h-6 text-white hover:text-rose-500" />
                      )}
                      <span className="font-semibold text-sm">
                        {post.likesCount}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComments(post);
                      }}
                      className="flex items-center space-x-2 text-white transition"
                    >
                      <FaComment className="w-6 h-6" />
                      <span className="font-semibold text-sm">
                        {post.commentsCount}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen(post);
                    }}
                  >
                    <img
                      src="/fullscreen.png"
                      alt="Fullscreen"
                      className="h-5 w-5"
                    />
                  </button>
                </div>

                {post.caption && (
                  <p className="text-sm mb-2 text-white break-words">
                    <span className="font-semibold mr-2">
                      {post.creator.username}
                    </span>
                    {post.caption}
                  </p>
                )}

                <button
                  onClick={() => handleComments(post)}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  View all {post.commentsCount} comments
                </button>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center mt-4">
              <CircularProgress size={24} sx={{ color: "inherit" }} />
            </div>
          )}
        </div>
      </div>

      {isCommentsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-neutral-900 w-full max-w-md h-[80vh] rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-neutral-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">Comments</h2>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div
              ref={commentScrollRef}
              onScroll={handleCommentScroll}
              className="flex-grow overflow-y-auto"
            >
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="p-2 border-b border-neutral-700 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.creator.image || "/user.png"}
                      alt={comment.creator.username}
                      className="w-6 h-6 rounded-full"
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
                          <button
                            onClick={() => {
                              setDeleteState(true);
                              setCommentDeleteId(comment.id);
                            }}
                            className="text-neutral-400 hover:text-white"
                          >
                            <MoreHorizIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-neutral-200">
                        {comment.comment}
                      </p>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center space-x-1 text-sm text-neutral-400 hover:text-white"
                        >
                          <img
                            src={comment.isLiked ? "/liked.png" : "/like.png"}
                            alt="Like"
                            className="h-3 w-3"
                          />
                          <span>{comment.likesCount} likes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
                    className="flex-1 outline-none  bg-neutral-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                    disabled={isPostingComment}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isPostingComment}
                    className="bg-indigo-500 text-white w-14 h-9 flex justify-center items-center rounded disabled:opacity-80"
                  >
                    {isPostingComment ? (
                      <CircularProgress size={18} sx={{ color: "inherit" }} />
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteState && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-lg overflow-hidden w-64">
            <button
              onClick={() => {
                if (commentDeleteId) {
                  deleteComment(commentDeleteId);
                }
                setDeleteState(false);
                setCommentDeleteId(null);
              }}
              className="w-full py-3 text-red-500 hover:bg-neutral-700 border-b border-neutral-700"
            >
              Delete
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
          </div>
        </div>
      )}
    </>
  );
};
