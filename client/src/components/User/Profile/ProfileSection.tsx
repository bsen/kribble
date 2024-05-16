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
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import { BottomBar } from "../../Bars/BottomBar";
import { NavBar } from "../../Bars/NavBar";
import { UserData } from "./UserData";
import { UserContext } from "../Context/UserContext";

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
      <div className="w-full bg-bgmain h-screen flex justify-center items-center">
        <div className="flex text-textmain flex-col gap-4 text-base items-center font-ubuntu font-semibold">
          Do you really want to delete the post ?
          <span className="text-xs font-light text-texttwo">
            note that you can not get back the deleted post
          </span>
          <div className="flex gap-5">
            <button
              onClick={deletePost}
              className="text-textmain bg-red-500 hover:bg-red-400 font-semibold px-4 py-1 rounded-full"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setDeleteState(false);
                setPostDeleteId("");
              }}
              className="text-black bg-stone-50 hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
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
      <div className="h-screen bg-bgmain w-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-semibold">
        An error occurred: {error.message}
      </div>
    );
  }

  return (
    <>
      <div
        className="h-screen p-2 overflow-y-auto no-scrollbar py-12 md:py-0"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        <UserData />
        <div
          className="overflow-y-auto no-scrollbar touch-action-none"
          ref={postsScrollContainerRef}
        >
          {postData.posts &&
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-2 p-2 rounded-md border border-bordermain  bg-bgmain"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${post.creator.username}`);
                      }}
                    >
                      <img
                        src={
                          post.creator.image ? post.creator.image : "/user.png"
                        }
                        alt="Profile"
                        className="w-9 h-9 rounded-full"
                      />
                    </div>

                    <div className="w-fit flex gap-2 items-center">
                      <>
                        <div className="flex gap-2 items-center">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/${post.creator.username}`);
                            }}
                            className="text-textmain text-sm lg:text-base hover:underline font-semibold"
                          >
                            {post.creator.username}
                          </div>

                          <div className="text-texttwo text-xs lg:text-sm font-ubuntu">
                            · {getTimeDifference(post.createdAt)}
                          </div>
                        </div>
                      </>
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
                          className="text-texttwo"
                          sx={{ fontSize: 20 }}
                        />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex flex-col gap-2 py-4 w-full">
                    {post.image && (
                      <img
                        src={post.image}
                        className="rounded-md w-[100%] md:w-[60%] border border-bordermain"
                      />
                    )}

                    <div className="text-textmain text-sm lg:text-base font-light">
                      {post.content}
                    </div>
                  </div>

                  <div className=" flex justify-between gap-2 items-center text-sm text-neutral-500">
                    <div className="flex gap-2 items-center">
                      <button
                        className="flex justify-center items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                      >
                        <div>
                          {post.isLiked ? (
                            <FavoriteIcon
                              sx={{
                                fontSize: 22,
                              }}
                              className="text-rose-600"
                            />
                          ) : (
                            <FavoriteIcon
                              sx={{
                                fontSize: 22,
                              }}
                              className="text-textmain"
                            />
                          )}
                        </div>
                      </button>
                      <div className="text-sm text-textmain">
                        {post.likesCount} likes
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div onClick={() => navigate(`/post/${post.id}`)}>
                        <MapsUgcRoundedIcon
                          sx={{ fontSize: 22 }}
                          className="text-textmain cursor-pointer"
                        />
                      </div>
                      <div className="text-sm text-textmain">
                        {post.commentsCount} comments
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {!postData.posts && (
            <div className="text-texttwo my-5  font-light text-center text-lg">
              No posts found
            </div>
          )}
        </div>
        <div>
          {isLoading && (
            <div className="w-full my-5 flex justify-center items-center">
              <CircularProgress />
            </div>
          )}
        </div>
        <BottomBar />
      </div>
    </>
  );
};
