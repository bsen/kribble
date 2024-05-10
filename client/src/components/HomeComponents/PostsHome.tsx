import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { BottomBar } from "../Mobile/BottomBar";

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
  const [userImage, setUserImage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
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

  async function getUser() {
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/current-user`,
      { token }
    );

    setUserImage(response.data.image);
    setCurrentUser(response.data.data);
  }

  useEffect(() => {
    getUser();
  }, []);
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
        <div className="top-0 rounded-b-md h-14 shadow-sm  bg-white/80 fixed w-full lg:w-[50%]">
          <div className="w-full h-full flex justify-between px-5 items-center">
            <button
              onClick={() => {
                navigate("/home");
              }}
            >
              <div className="lg:hidden bg-gradient-to-r from-indigo-500 to-orange-500  text-transparent bg-clip-text text-3xl font-ubuntu">
                kribble
              </div>
            </button>
            <button
              onClick={() => {
                navigate(`/${currentUser}`);
              }}
              className="flex gap-2 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg items-center text-sm font-normal text-neutral-800"
            >
              <img
                src={userImage ? userImage : "/user.png"}
                alt="Profile"
                className=" w-5 h-5  shadow-sm rounded-full"
              />
              Profile
            </button>
          </div>
        </div>
        <div>
          {postData.posts.length > 0 ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-2 border border-neutral-100 rounded-md p-4 bg-white"
              >
                <div className="flex gap-2">
                  <div>
                    {post.community ? (
                      <div>
                        {post.community && (
                          <Link
                            to={`/community/${post.community.name}`}
                            className="flex gap-2  mt-2 text-neutral-600"
                          >
                            {post.community && (
                              <img
                                src={post.community.image || "/group.png"}
                                className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                                alt="Community"
                              />
                            )}
                          </Link>
                        )}
                      </div>
                    ) : (
                      <>
                        {post.creator.image && !post.anonymity ? (
                          <Link to={`/${post.creator.username}`}>
                            <img
                              src={post.creator.image}
                              alt="Profile"
                              className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                            />
                          </Link>
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
                  <div className="w-[80%]">
                    <div className="w-fit flex gap-2 items-center">
                      {post.community ? (
                        <Link to={`/community/${post.community.name}`}>
                          {post.community && (
                            <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                              c/ {post.community.name}
                            </div>
                          )}
                        </Link>
                      ) : (
                        <>
                          {post.anonymity ? (
                            <div className="text-primarytextcolor text-sm lg:text-base d font-semibold">
                              {post.creator.username}
                            </div>
                          ) : (
                            <Link to={`/${post.creator.username}`}>
                              <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                                {post.creator.username}
                              </div>
                            </Link>
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
                        className="max-h-[80vh] mt-4 max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-neutral-200"
                      />
                    )}
                    <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                      {post.content}
                    </div>

                    <div className="flex  justify-start gap-5 items-center text-sm text-neutral-500">
                      <button
                        className="flex bg-rose-50 rounded-lg shadow-sm px-1 justify-center items-center gap-2 cursor-pointer"
                        onClick={() => handleLike(post.id)}
                      >
                        <div>
                          {post.isLiked ? (
                            <FavoriteIcon
                              sx={{
                                fontSize: 18,
                              }}
                              className="text-rose-500"
                            />
                          ) : (
                            <FavoriteBorderIcon
                              sx={{
                                fontSize: 18,
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
                          sx={{ fontSize: 18 }}
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
          )}
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
