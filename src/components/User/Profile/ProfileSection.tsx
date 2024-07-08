import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, LinearProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NotesIcon from "@mui/icons-material/Notes";
import { NavBar } from "../../Bars/NavBar";
import { UserContext } from "../Context/UserContext";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { FollowersComponent } from "../Follow/FollowersComponent";
import { FollowingComponent } from "../Follow/FollowingComponent";
import { CommunitiesComponent } from "../Communities/CommunitiesComponent";

interface UserData {
  username: string;
  image: string;
  bio: string;
  instagramLink: string;
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

interface ProfileSectionProps {}

export const ProfileSection: React.FC<ProfileSectionProps> = () => {
  const { username } = useParams();
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postDeleteId, setPostDeleteId] = useState("");
  const [deleteState, setDeleteState] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postsScrollContainerRef = useRef<HTMLDivElement>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showCommunities, setShowCommunities] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowUserLoading, setIsFollowUserLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    username: "",
    image: "",
    bio: "",
    instagramLink: "",
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

  const followUser = useCallback(async () => {
    try {
      setIsFollowUserLoading(true);
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
    } finally {
      setIsFollowUserLoading(false);
    }
  }, [isFollowing, token, username]);

  const navigateToEditProfile = useCallback(() => {
    navigate("/edit/profile", { state: { userData } });
  }, [navigate, userData]);

  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });

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

  const deletePost = useCallback(async () => {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/post/delete`, {
        token,
        postDeleteId,
      });
      setDeleteState(false);
      setPostDeleteId("");
      window.location.reload();
      setLoadingState(false);
    } catch (error) {
      setError(error as Error);
      setLoadingState(false);
    }
  }, [token, postDeleteId]);

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

  const getTimeDifference = useCallback((createdAt: string) => {
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
  }, []);

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
      <div className="text-center my-10 text-rosemain font-normal">
        {error.message}
      </div>
    );
  }

  if (loadingState) {
    return <LinearProgress sx={{ backgroundColor: "black" }} />;
  }

  if (deleteState) {
    return (
      <div className="w-full bg-dark h-screen flex justify-center items-center">
        <div className="flex text-light text-center flex-col gap-6 text-base items-center font-ubuntu font-normal">
          Do you really want to delete the post ?
          <br />
          Note that you can not get back the deleted post
          <div className="flex gap-5">
            <button
              onClick={deletePost}
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
      <NavBar />
      <div
        className="flex justify-center h-screen overflow-y-auto no-scrollbar pb-72"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div className="w-full md:w-[35%] px-2">
          {showFollowers && (
            <FollowersComponent
              closeComponent={() => setShowFollowers(false)}
            />
          )}
          {showFollowing && (
            <FollowingComponent
              closeComponent={() => setShowFollowing(false)}
            />
          )}
          {showCommunities && (
            <CommunitiesComponent
              closeComponent={() => setShowCommunities(false)}
            />
          )}

          <div className="mt-2 flex w-full justify-center items-center gap-2">
            <img
              src={userData.image ? userData.image : "/user.png"}
              className="lg:w-20 lg:h-20 w-16 rounded-lg border border-semidark"
            />

            <div className="w-full">
              <div className="flex items-center gap-2 justify-end">
                <div>
                  {userData.instagramLink && (
                    <a
                      href={userData.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="/instagram.png"
                        className="h-6 w-6 rounded-lg"
                      />
                    </a>
                  )}
                </div>
                <div>
                  {token && (
                    <div>
                      {currentUser === username && (
                        <button
                          onClick={navigateToEditProfile}
                          className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                        >
                          Edit
                        </button>
                      )}
                      {currentUser !== username && (
                        <div className="flex my-2 gap-4 justify-between items-center">
                          <button
                            onClick={followUser}
                            disabled={isFollowUserLoading}
                            className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                          >
                            {isFollowUserLoading ? (
                              <CircularProgress
                                size="15px"
                                className="my-0.5"
                                sx={{ color: "rgb(200 200 200);" }}
                              />
                            ) : (
                              <div>
                                {isFollowing ? (
                                  <div>Unfollow</div>
                                ) : (
                                  <div>Follow</div>
                                )}
                              </div>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {!token && (
                    <button
                      onClick={() => {
                        navigate("/auth");
                      }}
                      className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                    >
                      Follow
                    </button>
                  )}
                </div>
              </div>

              <div className="text-base font-normal text-light">
                {userData.username}
              </div>
              <div className="flex text-semilight font-ubuntu items-center gap-2 font-light text-sm">
                <button onClick={() => setShowFollowers(true)}>
                  <div className="flex gap-1 items-center">
                    {userData.followersCount} Followers
                  </div>
                </button>
                {currentUser === username && (
                  <button onClick={() => setShowFollowing(true)}>
                    <div className="flex gap-1 items-center">
                      {userData.followingCount} Following
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-sm text-semilight font-ubuntu font-light">
              {userData.bio ? userData.bio : ""}
            </div>
          </div>

          <div>
            <div className="flex gap-2  rounded-lg mt-2 overflow-x-auto no-scrollbar">
              {currentUser === username && (
                <button
                  onClick={() => {
                    setShowCommunities(true);
                  }}
                  className="text-xs text-semilight flex items-center gap-1 font-light bg-indigomain px-3 py-1 rounded-lg"
                >
                  Communities
                </button>
              )}

              {currentUser === username && (
                <button
                  onClick={() => {
                    navigate("/hidden/posts");
                  }}
                  className="text-xs text-semilight font-light bg-indigomain px-3 py-1 rounded-lg"
                >
                  Hidden&nbsp;posts
                </button>
              )}
              {currentUser === username && (
                <button
                  onClick={() => {
                    navigate("/comments");
                  }}
                  className="text-xs text-semilight font-light bg-indigomain px-3 py-1 rounded-lg"
                >
                  Comments
                </button>
              )}

              {currentUser === username && (
                <button
                  onClick={() => {
                    navigate("/create/community");
                  }}
                  className="text-xs text-semilight flex items-center gap-1 font-light bg-indigomain px-3 py-1 rounded-lg"
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                  <span>Community</span>
                </button>
              )}
            </div>
          </div>
          <div
            className="overflow-y-auto no-scrollbar touch-action-none"
            ref={postsScrollContainerRef}
          >
            {postData.posts.length > 0 ? (
              postData.posts.map((post, index) => (
                <div key={index} className="my-2 border-b border-semidark">
                  <div className="py-4 flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      {post.community ? (
                        <div>
                          {post.community && (
                            <div>
                              {post.community && (
                                <img
                                  src={post.community.image || "/group.png"}
                                  className="w-8 h-8 rounded-lg"
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
                              className="w-8 h-8 rounded-lg"
                            />
                          ) : (
                            <img
                              src={
                                post.creator.image
                                  ? post.creator.image
                                  : "/user.png"
                              }
                              alt="Profile"
                              className="w-8 h-8 rounded-lg"
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
                    <div className="relative w-full aspect-square overflow-hidden">
                      <video
                        data-post-id={post.id}
                        src={post.video}
                        loop
                        playsInline
                        muted
                        className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
                        onClick={() => togglePlay(post.id)}
                      />
                      <button
                        className="absolute bottom-2 right-2 bg-dark/40 text-light h-7 w-7 flex justify-center items-center rounded-full"
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
                    <img src={post.image} />
                  ) : null}

                  {post.caption && (
                    <div className="text-light my-2 font-ubuntu font-light text-base">
                      {post.caption}
                    </div>
                  )}

                  <div className="py-4 flex items-center justify-between">
                    <div className="flex gap-6 items-center">
                      <button
                        className="text-light flex justify-center items-center gap-2 cursor-pointer"
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
                        className="text-light flex justify-center items-center gap-2 cursor-pointer"
                      >
                        <NotesIcon sx={{ fontSize: 24 }} />
                        {post.commentsCount}
                      </button>
                    </div>
                    <div>
                      {currentUser === username && (
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
        </div>
      </div>
    </>
  );
};
