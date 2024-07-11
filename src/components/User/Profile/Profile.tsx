import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  CircularProgress,
  Grid,
  Box,
  Typography,
  IconButton,
  Modal,
  Button,
  LinearProgress,
  TextField,
} from "@mui/material";
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
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postsScrollContainerRef = useRef<HTMLDivElement>(null);
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
    async (cursor: string | null | undefined, truncate: boolean) => {
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
    const postsScrollContainer = postsScrollContainerRef.current;
    if (
      postsScrollContainer &&
      postsScrollContainer.scrollTop + postsScrollContainer.clientHeight >=
        postsScrollContainer.scrollHeight &&
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
  const toggleFullscreen = (post: Post) => {
    navigate(`/post/${post.id}`);
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
            backgroundColor: "gray",
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
          {userData && (
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url(${userData.image || "/profile.png"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    cursor: "pointer",
                    "&:focus": {
                      outline: "none",
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 2,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-white text-base">
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
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
                  </Box>
                  {userData.bio && (
                    <Typography
                      variant="body2"
                      color="white"
                      sx={{
                        maxHeight: "40px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                          width: "4px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          borderRadius: "2px",
                          backgroundColor: "rgba(0, 0, 0)",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          backgroundColor: "rgba(0, 0, 0)",
                        },
                        msOverflowStyle: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255, 255, 255,0.4) transparent",
                        textAlign: "center",
                      }}
                    >
                      <div className="text-light">{userData.bio}</div>
                    </Typography>
                  )}
                  {currentUser === username ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/profile/settings", { state: { userData } });
                      }}
                      className="mt-2 text-xs px-4 py-1.5 bg-white hover:bg-neutral-100 text-black font-normal rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                    >
                      Settings
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow();
                      }}
                      className={`mt-2 text-xs px-4 py-1.5 font-normal rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                        isFollowing
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </Box>
              </Box>
            </Grid>
          )}
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
                            color: "#C8C8C8",
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
                      <div className="flex">
                        {currentUser === username && (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPostDeleteModalOpen(true);
                              setPostToDelete(post.id);
                            }}
                            size="small"
                            sx={{ color: "white" }}
                          >
                            <MoreHorizIcon />
                          </IconButton>
                        )}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFullscreen(post);
                          }}
                          size="small"
                        >
                          <img src="/fullscreen.png" className="h-5" />
                        </IconButton>
                      </div>
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
                            color: "#C8C8C8",
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
                      <div className="flex">
                        {currentUser === username && (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPostDeleteModalOpen(true);
                              setPostToDelete(post.id);
                            }}
                            size="small"
                            sx={{ color: "white" }}
                          >
                            <MoreHorizIcon />
                          </IconButton>
                        )}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFullscreen(post);
                          }}
                          size="small"
                        >
                          <img src="/fullscreen.png" className="h-5" />
                        </IconButton>
                      </div>
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
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
          </Box>
        )}
      </Box>
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
                      color: "rgb(220 220 220);",
                      "&:hover": {
                        backgroundColor: "black",
                      },
                    }}
                  >
                    {isPostingComment ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Post"
                    )}
                  </Button>
                ),
                style: { color: "rgb(220 220 220);" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#262626",
                  },
                  "&:hover fieldset": {
                    borderColor: "#262626",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#262626",
                  },
                  "& input": {
                    color: "white",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "white",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#262626",
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
      <Modal
        open={isPostDeleteModalOpen}
        onClose={() => {
          setIsPostDeleteModalOpen(false);
          setPostToDelete(null);
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
            onClick={handlePostDelete}
            sx={{
              color: "error.main",
              py: 2,
              borderBottom: "1px solid #363636",
              borderRadius: "8px 8px 0 0",
              textTransform: "none",
            }}
          >
            Delete Post
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setIsPostDeleteModalOpen(false);
              setPostToDelete(null);
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
