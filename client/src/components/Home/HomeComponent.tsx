import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import ReplyIcon from "@mui/icons-material/Reply";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { BottomBar } from "../Bars/BottomBar";
import { NavBar } from "../Bars/NavBar";
import { CircularProgress } from "@mui/material";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
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

export const HomeComponent = () => {
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
      const response = await axios.post(`${BACKEND_URL}/api/user/feed/posts`, {
        token,
        cursor,
      });
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
        className="h-screen overflow-y-auto no-scrollbar py-12 md:py-0"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        {postData.posts ? (
          postData.posts.map((post, index) => (
            <div
              key={index}
              className="my-3 p-3  rounded-md border border-bordermain  bg-bgpost"
            >
              <div className="flex items-center gap-2">
                <div>
                  {post.community ? (
                    <div>
                      {post.community && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/community/${post.community.name}`);
                          }}
                          className="flex gap-2 mt-2 text-textmain"
                        >
                          {post.community && (
                            <img
                              src={post.community.image || "/group.png"}
                              className="w-9 h-9 rounded-full"
                              alt="Community"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
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
                  )}
                </div>
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
                            <div className="text-textmain text-sm lg:text-base hover:underline font-semibold">
                              c/ {post.community.name}
                            </div>
                          )}
                        </div>
                        <div className="text-texttwo text-xs lg:text-sm font-ubuntu">
                          · {getTimeDifference(post.createdAt)}
                        </div>
                      </div>
                      <div className="text-texttwo text-xs  font-light">
                        by {post.creator.username}
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
              <div className="w-full flex flex-col">
                <div className="flex flex-col gap-2 py-4  w-full">
                  {post.image && (
                    <img
                      src={post.image}
                      className="rounded-md w-[100%] md:w-[60%]"
                    />
                  )}

                  <div className="text-textmain text-sm lg:text-base font-light">
                    {post.content}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 items-center text-sm text-texttwo">
                  <button
                    className="w-16 bg-rose-100 text-rosemain py-1  rounded-md flex justify-center items-center gap-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                  >
                    {post.isLiked ? (
                      <div>
                        <FavoriteIcon
                          sx={{
                            fontSize: 20,
                          }}
                          className="text-rosemain"
                        />
                      </div>
                    ) : (
                      <div>
                        <FavoriteBorderOutlinedIcon
                          sx={{
                            fontSize: 20,
                          }}
                          className="text-rosemain"
                        />
                      </div>
                    )}

                    {post.likesCount}
                  </button>
                  <button
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="w-16 text-indigomain py-1  bg-indigo-100 rounded-md flex justify-center items-center gap-2 cursor-pointer"
                  >
                    <ReplyIcon sx={{ fontSize: 22 }} />
                    {post.commentsCount}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-texttwo my-5  font-light text-center text-lg">
            No posts found
          </div>
        )}
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
