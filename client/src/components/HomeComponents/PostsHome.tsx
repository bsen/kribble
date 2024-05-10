import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { BottomBar } from "../Bars/BottomBar";
import { NavBar } from "../Bars/NavBar";

interface Post {
  id: string;
  creator: {
    id: string;
    username: string;
    image: string | null;
  };
  community: {
    name: string;
    image: string | null;
  };
  content: string;
  image: string;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  anonymity: string;
  isLiked: boolean;
}

export const PostsHome = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });

  async function getFeedPosts(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/feed/posts`,
        { token, cursor }
      );
      setPostData({
        posts: [...postData.posts, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
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
        scrollContainerRef.current.scrollHeight &&
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
      await axios.post(
        `${BACKEND_URL}/api/server/v1/post/post-like-unlike`,
        details
      );
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

  const getTimeDifference = (createdAt: string) => {
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
  };

  return (
    <>
      <div
        className="h-screen overflow-y-auto no-scrollbar py-14"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        <div>
          {postData.posts.length > 0 ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-2 p-4 border hover:bg-white/50 border-neutral-100 rounded-md bg-white"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <div className="flex gap-2">
                  <div>
                    {post.community ? (
                      <div>
                        {post.community && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/community/${post.community.name}`);
                            }}
                            className="flex gap-2 mt-2 text-neutral-600"
                          >
                            {post.community && (
                              <img
                                src={post.community.image || "/group.png"}
                                className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                                alt="Community"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {post.creator.image && !post.anonymity ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/${post.creator.username}`);
                            }}
                          >
                            <img
                              src={post.creator.image}
                              alt="Profile"
                              className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                            />
                          </div>
                        ) : (
                          <img
                            src="/user.png"
                            alt="Anonymous"
                            className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="w-full">
                    <div className="w-fit flex gap-2 items-center">
                      {post.community ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/community/${post.community.name}`);
                          }}
                        >
                          {post.community && (
                            <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                              c/ {post.community.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {post.anonymity ? (
                            <div className="text-primarytextcolor text-sm lg:text-base d font-semibold">
                              {post.creator.username}
                            </div>
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/${post.creator.username}`);
                              }}
                              className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold"
                            >
                              {post.creator.username}
                            </div>
                          )}
                        </>
                      )}
                      <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                        · {getTimeDifference(post.createdAt)}
                      </div>
                    </div>

                    {post.image && (
                      <img
                        src={post.image}
                        className="mt-4 max-w:w-[100%] lg:max-w-[50%] rounded-lg border border-neutral-100"
                      />
                    )}

                    <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                      {post.content}
                    </div>

                    <div className="flex justify-start gap-5 items-center text-sm text-neutral-500">
                      <button
                        className="flex bg-rose-50 rounded-lg shadow-sm px-1 justify-center items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                      >
                        <div>
                          {post.isLiked ? (
                            <FavoriteIcon
                              sx={{
                                fontSize: 20,
                              }}
                              className="text-rose-500"
                            />
                          ) : (
                            <FavoriteBorderIcon
                              sx={{
                                fontSize: 20,
                              }}
                              className="text-rose-500"
                            />
                          )}
                        </div>

                        <div className="text-base text-rose-500">
                          {post.likesCount}
                        </div>
                      </button>

                      <Link
                        to={`/post/${post.id}`}
                        className="flex bg-indigo-50 rounded-lg shadow-sm px-1 justify-center items-center gap-2 cursor-pointer"
                      >
                        <ChatBubbleOutlineRoundedIcon
                          sx={{ fontSize: 20 }}
                          className="text-indigo-500"
                        />
                        <div className="text-base text-indigo-500">
                          {post.commentsCount}
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center font-ubuntu my-5 text-primarytextcolor">
              No posts found.
            </div>
          )}{" "}
        </div>
        <BottomBar />

        {isLoading && (
          <div className="text-center my-5">
            <CircularProgress color="inherit" />
          </div>
        )}
      </div>
    </>
  );
};
