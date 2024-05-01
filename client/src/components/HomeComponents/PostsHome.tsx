import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { SearchBox } from "./SearchBar";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
interface Post {
  id: string;
  creator: {
    id: string;
    username: string;
    name: string;
    image: string | null;
  };
  content: string;
  image: string;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  isLiked: boolean;
}

export const PostsHome = () => {
  const token = localStorage.getItem("token");
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getAllPosts(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/paginated-allposts`,
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
    getAllPosts();
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
      getAllPosts(postData.nextCursor);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const details = { postId, token };
      await axios.post(
        `${BACKEND_URL}/api/server/v1/post/like-unlike`,
        details
      );
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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        className="h-screen overflow-y-auto no-scrollbar pt-16"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <SearchBox />
        <div>
          {postData.posts.length > 0 ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="border-b border-neutral-200 p-3 bg-white"
              >
                <div>
                  <div className="flex gap-2">
                    <div>
                      <Link to={`/${post.creator.username}`}>
                        <img
                          src={
                            post.creator.image
                              ? post.creator.image
                              : "/user.png"
                          }
                          alt="Profile"
                          className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                        />
                      </Link>
                    </div>
                    <div className="w-[80%]">
                      <Link to={`/${post.creator.username}`}>
                        <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                          {post.creator.name}
                        </div>
                      </Link>
                      <div className="flex gap-2 items-center">
                        <Link to={`/${post.creator.username}`}>
                          <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                            @{post.creator.username}
                          </div>
                        </Link>
                        <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                          · {post.createdAt.slice(0, 10)}
                        </div>
                      </div>
                      <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                        {post.content}
                      </div>
                      <div>
                        <img
                          src={post.image}
                          className="max-h-[80vh]  max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-neutral-200"
                        />
                      </div>
                      <div>
                        <div className="flex gap-2 text-neutral-600"></div>
                      </div>
                      <div className="flex mt-3 justify-start gap-5 items-center text-sm text-neutral-500">
                        <div
                          className="flex bg-rose-50 rounded-lg shadow-sm px-1 justify-center items-center gap-2 cursor-pointer"
                          onClick={() => handleLike(post.id)}
                        >
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

                          <div className="text-base text-rose-500">
                            {post.likesCount}
                          </div>
                        </div>
                        <div className="flex bg-blue-50 rounded-lg shadow-sm px-1 justify-center items-center gap-2 cursor-pointer">
                          <Link to={`/post/${post.id}`}>
                            <ChatBubbleOutlineRoundedIcon
                              sx={{ fontSize: 18 }}
                              className="text-blue-500"
                            />
                          </Link>
                          <div className="text-base text-blue-500">
                            {post.commentsCount}
                          </div>
                        </div>
                      </div>
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

        {isLoading && (
          <div className="text-center my-5">
            <CircularProgress />
          </div>
        )}
      </div>
    </>
  );
};
