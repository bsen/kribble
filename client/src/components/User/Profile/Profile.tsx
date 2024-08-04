import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { CircularProgress, LinearProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { UserContext } from "../Context/UserContext";
import { MenuBar } from "../../Menu/MenuBar";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { BACKEND_URL } from "../../../config";
import { FollowersComponent } from "../FollowList/FollowersComponent";
import { FollowingComponent } from "../FollowList/FollowingComponent";

interface UserData {
  username: string;
  image: string;
  bio: string;
  link: string;
  followersCount: string;
  followingCount: string;
}

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

interface ProfileProps {}

export const Profile: React.FC<ProfileProps> = () => {
  const { username } = useParams();
  const location = useLocation();
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loadingState, setLoadingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const commentScrollRef = useRef<HTMLDivElement>(null);
  const [commentText, setCommentText] = useState("");
  const [deleteState, setDeleteState] = useState(false);
  const [commentDeleteId, setCommentDeleteId] = useState<string | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isPostDeleteModalOpen, setIsPostDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentNextCursor, setCommentNextCursor] = useState<string | null>(
    null
  );
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  const [userData, setUserData] = useState<UserData>({
    username: "",
    image: "",
    bio: "",
    link: "",
    followersCount: "",
    followingCount: "",
  });

  const getUserData = useCallback(async () => {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/profile/data`,
        { token, username }
      );
      if (!response.data.userdata) {
        setError(new Error("Sorry, this page isn't available."));
      } else {
        setUserData(response.data.userdata);
        setIsFollowing(response.data.following);
      }
      setLoadingState(false);
    } catch (error: any) {
      setError(error as Error);
      setLoadingState(false);
    }
  }, [token, username]);

  useEffect(() => {
    getUserData();
  }, [username]);

  const getAllPosts = useCallback(
    async (cursor: string | null | undefined, truncate: boolean = false) => {
      if (postData.posts.length > 0 && !cursor && !truncate) return;
      try {
        setIsLoading(true);
        const response = await axios.post(`${BACKEND_URL}/api/post/all/posts`, {
          token,
          cursor,
          username,
        });
        if (!response.data.posts) {
          setError(new Error("Sorry, this page isn't available."));
        } else {
          setPostData((prevData) => ({
            posts: truncate
              ? [...response.data.posts]
              : [...prevData.posts, ...response.data.posts],
            nextCursor: response.data.nextCursor,
          }));
        }
        setIsLoading(false);
      } catch (error: any) {
        setError(error as Error);
        setIsLoading(false);
      }
    },
    [token, username]
  );

  useEffect(() => {
    getAllPosts(null, true);
  }, [username]);

  const handleFollow = useCallback(async () => {
    try {
      setIsFollowing((prevState) => !prevState);
      setUserData((prevData) => ({
        ...prevData,
        followersCount: isFollowing
          ? (parseInt(prevData.followersCount) - 1).toString()
          : (parseInt(prevData.followersCount) + 1).toString(),
      }));
      const details = { username, token };
      await axios.post(
        `${BACKEND_URL}/api/user/follow/follow/unfollow`,
        details
      );
    } catch (error) {
      setError(error as Error);
      setIsFollowing((prevState) => !prevState);
      setUserData((prevData) => ({
        ...prevData,
        followersCount: isFollowing
          ? (parseInt(prevData.followersCount) + 1).toString()
          : (parseInt(prevData.followersCount) - 1).toString(),
      }));
    }
  }, [isFollowing, token, username]);

  const getComments = async (postId: string, cursor?: string) => {
    try {
      setIsLoadingComments(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/post/comment/all/comments`,
        { token, postId, cursor }
      );
      if (cursor) {
        setComments((prevComments) => [...prevComments, ...response.data.data]);
      } else {
        setComments(response.data.data);
      }
      setCommentNextCursor(response.data.nextCursor);
      setIsLoadingComments(false);
    } catch (error) {
      console.log(error);
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

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const newScrollPosition = scrollContainerRef.current.scrollTop;
      setScrollPosition(newScrollPosition);
      localStorage.setItem(
        "profileScrollPosition",
        newScrollPosition.toString()
      );
    }

    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight - 100 &&
      postData.nextCursor &&
      !isLoading
    ) {
      getAllPosts(postData.nextCursor, false);
    }
  }, [getAllPosts, isLoading, postData.nextCursor]);

  const handlePostDelete = async () => {
    if (postToDelete) {
      try {
        await axios.post(`${BACKEND_URL}/api/post/delete`, {
          token,
          postId: postToDelete,
        });
        setPostData((prevData) => ({
          ...prevData,
          posts: prevData.posts.filter((post) => post.id !== postToDelete),
        }));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
    setIsPostDeleteModalOpen(false);
    setPostToDelete(null);
  };

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
  const toggleFullscreen = useCallback(
    (post: Post) => {
      navigate(`/post/${post.id}`, {
        state: {
          scrollPosition,
          posts: postData.posts,
          nextCursor: postData.nextCursor,
          username: userData.username,
        },
      });
    },
    [navigate, scrollPosition, postData, userData.username]
  );

  useEffect(() => {
    const state = location.state as {
      scrollPosition?: number;
      posts?: Post[];
      nextCursor?: string | null;
      username?: string;
    };

    if (state?.posts && state.username === username) {
      setPostData({
        posts: state.posts,
        nextCursor: state.nextCursor || null,
      });
    } else {
      getAllPosts(null, true);
    }

    const restoreScroll = () => {
      const savedScrollPosition = localStorage.getItem("profileScrollPosition");
      if (savedScrollPosition && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = parseInt(
          savedScrollPosition,
          10
        );
      }
    };

    // Attempt to restore scroll immediately
    restoreScroll();

    // If that doesn't work, try again after a short delay
    const timer = setTimeout(restoreScroll, 100);

    return () => clearTimeout(timer);
  }, [location.state, username, getAllPosts]);

  useEffect(() => {
    if (postData.posts.length > 0) {
      const savedScrollPosition = localStorage.getItem("profileScrollPosition");
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

  if (error) {
    return (
      <div className="text-center my-10 text-rosemain font-normal">
        {error.message}
      </div>
    );
  }

  if (loadingState) {
    return (
      <LinearProgress
        sx={{
          backgroundColor: "black",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "neutral",
          },
        }}
      />
    );
  }

  return (
    <>
      {showFollowers && (
        <FollowersComponent closeComponent={() => setShowFollowers(false)} />
      )}
      {showFollowing && (
        <FollowingComponent closeComponent={() => setShowFollowing(false)} />
      )}

      <MenuBar />
      <div className="bg-black min-h-screen text-white">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="p-2 pb-16 h-[calc(100vh-56px)] overflow-y-auto scrollbar-hide"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userData && (
              <div className="flex py-2 flex-col items-center justify-center gap-2">
                <div className="relative w-40 h-40">
                  <div
                    className="w-full h-full rounded-full bg-cover bg-center cursor-pointer"
                    style={{
                      backgroundImage: `url(${
                        userData.image || "/profile.png"
                      })`,
                    }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="text-white text-lg">
                      {userData.username}
                    </div>
                    {userData.link && (
                      <a
                        href={userData.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src="/link.png"
                          className="h-3.5 w-3.5"
                          alt="Link"
                        />
                      </a>
                    )}
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFollowers(true);
                      }}
                      className="flex gap-1 text-light text-sm"
                    >
                      <span>{userData.followersCount}</span>
                      <div>Followers</div>
                    </button>
                    {currentUser === username && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFollowing(true);
                        }}
                        className="flex gap-1 text-light text-sm"
                      >
                        <span>{userData.followingCount}</span>
                        <div>Following</div>
                      </button>
                    )}
                  </div>
                  {userData.bio && (
                    <div className="text-light text-sm text-center max-h-10 overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
                      {userData.bio}
                    </div>
                  )}
                  {currentUser === username ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/profile/settings", { state: { userData } });
                      }}
                      className="mt-2 text-xs px-4 py-1.5 bg-white text-black font-normal rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    >
                      Settings
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow();
                      }}
                      className={`mt-2 text-xs px-4 py-1.5 font-normal rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${
                        isFollowing
                          ? "bg-neutral-800 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
              </div>
            )}
            {postData.posts.map((post, index) => (
              <div key={index} className="relative">
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                  {post.video ? (
                    <video
                      data-post-id={post.id}
                      src={post.video}
                      loop
                      playsInline
                      muted={true}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      controlsList="nodownload"
                    />
                  ) : post.image ? (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <span className="text-neutral-400">No media</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 bg-black/80">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      to={`/${post.creator.username}`}
                      className="text-sm font-semibold hover:underline text-white"
                    >
                      {post.creator.username}
                    </Link>
                    <span className="text-xs text-neutral-300">
                      {getTimeDifference(post.createdAt)}
                    </span>
                  </div>

                  {post.caption && (
                    <p className="text-sm text-white mb-1 line-clamp-2">
                      {post.caption}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (token) handleLike(post.id);
                          else navigate("/auth");
                        }}
                        className="flex items-center space-x-1 text-white"
                      >
                        <img
                          src={post.isLiked ? "/liked.png" : "/like.png"}
                          alt="Like"
                          className="h-4 w-4"
                        />
                        <span>{post.likesCount}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComments(post);
                        }}
                        className="flex items-center space-x-1 text-white"
                      >
                        <img
                          src="/comment.png"
                          alt="Comment"
                          className="h-4 w-4"
                        />
                        <span>{post.commentsCount}</span>
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      {currentUser === username && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPostDeleteModalOpen(true);
                            setPostToDelete(post.id);
                          }}
                          className="mr-2"
                        >
                          <MoreHorizIcon className="text-white" />
                        </button>
                      )}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                      className="w-8 h-8 rounded-full"
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
                    className="bg-white text-black w-14 h-9 flex justify-center items-center rounded disabled:opacity-80"
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

      {isPostDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-lg overflow-hidden w-64">
            <button
              onClick={handlePostDelete}
              className="w-full py-3 text-red-500 hover:bg-neutral-700 border-b border-neutral-700"
            >
              Delete Post
            </button>
            <button
              onClick={() => {
                setIsPostDeleteModalOpen(false);
                setPostToDelete(null);
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
