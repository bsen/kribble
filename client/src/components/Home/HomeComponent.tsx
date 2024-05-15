import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { BottomBar } from "../Bars/BottomBar";
import { NavBar } from "../Bars/NavBar";
import { CircularProgress } from "@mui/material";

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
        className="h-screen p-2 flex justify-center overflow-y-auto no-scrollbar py-12 md:py-0"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        <div className="w-[100%] md:w-[58%]">
          {postData.posts ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-4 p-2 py-4 rounded-md border border-bordermain  bg-bgmain"
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
                            post.creator.image
                              ? post.creator.image
                              : "/user.png"
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
                  <div className="flex flex-col gap-2 py-4 w-full">
                    {post.image && (
                      <img src={post.image} className="rounded-md" />
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
                              className="text-neutral-400"
                            />
                          )}
                        </div>
                      </button>
                      <div className="text-sm text-texttwo">
                        {post.likesCount} likes
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div onClick={() => navigate(`/post/${post.id}`)}>
                        <MapsUgcRoundedIcon
                          sx={{ fontSize: 22 }}
                          className="text-texttwo cursor-pointer"
                        />
                      </div>
                      <div className="text-sm text-neutral-400">
                        {post.commentsCount} comments
                      </div>
                    </div>
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
        </div>

        <BottomBar />
      </div>
    </>
  );
};
