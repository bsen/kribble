import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import { BottomBar } from "../../Bars/BottomBar";
import { NavBar } from "../../Bars/NavBar";
import { UserData } from "./UserData";
import { UserContext } from "../Context/UserContext";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
interface Post {
  id: string;
  creator: {
    id: string;
    username: string;
    image: string | null;
  };
  content: string;
  image: string;
  createdAt: string;
  likesCount: string;
  commentsCount: string;
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
        const response = await axios.post(
          `${BACKEND_URL}/api/user/post/all/posts`,
          { token, cursor, username }
        );
        setPostData((prevData) => ({
          posts: truncate
            ? [...response.data.posts]
            : [...prevData.posts, ...response.data.posts],
          nextCursor: response.data.nextCursor,
        }));
        setIsLoading(false);
      } catch (error) {
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
      await axios.post(`${BACKEND_URL}/api/user/post/delete`, {
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

  if (deleteState) {
    return (
      <div className="w-full bg-dark h-screen flex justify-center items-center">
        <div className="flex text-light flex-col gap-4 text-base items-center font-ubuntu font-normal">
          Do you really want to delete the post ?
          <span className="text-xs font-light text-semilight">
            note that you can not get back the deleted post
          </span>
          <div className="flex gap-5">
            <button
              onClick={deletePost}
              className="text-light bg-red-500 hover:bg-red-400 font-normal px-4 py-1 rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setDeleteState(false);
                setPostDeleteId("");
              }}
              className="text-black bg-stone-50 hover:bg-neutral-200 font-normal px-4 py-1 border border-neutral-300 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingState) {
    return (
      <div className="w-full my-5 flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-normal">
        An error occurred: {error.message}
      </div>
    );
  }

  return (
    <>
      <div
        className="h-screen overflow-y-auto no-scrollbar py-12 md:py-0"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        <UserData />
        <div
          className="overflow-y-auto no-scrollbar touch-action-none"
          ref={postsScrollContainerRef}
        >
          {postData.posts.length > 0 ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-3  rounded-lg border border-semidark  bg-dark"
              >
                {post.image && (
                  <img src={post.image} className="rounded-t-lg w-[100%]" />
                )}

                {post.content && (
                  <div className="text-light my-6 px-3 font-ubuntu font-light text-base">
                    {post.content}
                  </div>
                )}
                <div className="border-t border-semidark py-4 flex flex-col gap-4">
                  <div className="flex gap-2 px-3 items-center text-base text-semilight">
                    <button
                      className="bg-semidark text-light px-2   rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
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
                          <FavoriteBorderOutlinedIcon
                            sx={{
                              fontSize: 22,
                            }}
                            className="text-light"
                          />
                        </div>
                      )}
                      {post.likesCount}
                    </button>

                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="bg-semidark text-light px-2   rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <ReplyIcon sx={{ fontSize: 24 }} />
                      {post.commentsCount}
                    </button>
                  </div>
                  <div className="flex w-full justify-between rounded-lg items-center px-3">
                    <div className="flex gap-2 items-center">
                      <div>
                        <img
                          src={
                            post.creator.image
                              ? post.creator.image
                              : "/user.png"
                          }
                          alt="Profile"
                          className="w-7 h-7 rounded-lg"
                        />
                      </div>
                      <div className="text-light text-sm lg:text-base font-normal">
                        {post.creator.username}
                      </div>

                      <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                        · {getTimeDifference(post.createdAt)}
                      </div>
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
