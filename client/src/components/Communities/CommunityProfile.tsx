import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { SearchBox } from "../HomeComponents/SearchBar";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { CircularProgress } from "@mui/material";
interface CommunityData {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  membersCount: string;
  postsCount: string;
}
interface Post {
  id: string;
  creator: {
    id: string;
    username: string;
    name: string;
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
  isLiked: boolean;
}
export const CommunityProfile: React.FC = () => {
  const { name } = useParams();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityData>({
    id: "",
    name: "",
    description: "",
    category: "",
    image: "",
    membersCount: "",
    postsCount: "",
  });
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  const getCommunityData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/community/one-community-data`,
        { token, name }
      );
      setCommunityData(response.data.data);
      setIsJoined(response.data.joined);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCommunityData();
  }, []);

  const handleJoinCommunity = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${BACKEND_URL}/api/server/v1/community/join-leave-community`,
        { token, name }
      );
      getCommunityData();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getAllPosts(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/community/community-all-posts`,
        { token, cursor, name }
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
        `${BACKEND_URL}/api/server/v1/post/post-like-unlike`,
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
        className="h-screen overflow-y-auto no-scrollbar py-14"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <SearchBox />
        <div className="w-full p-4 flex flex-col items-start border-b border-neutral-200">
          <div className="flex justify-between w-full items-start">
            <img
              src={communityData.image || "/group.png"}
              alt={communityData.name}
              className="w-24 rounded-full borderßborder-neutral-50 mb-2"
            />
            <div className="flex my-2 gap-4 justify-between items-center">
              <button
                onClick={handleJoinCommunity}
                className="bg-neutral-800 text-background px-4 py-1 text-sm rounded-full font-ubuntu"
              >
                <div>{isJoined ? <div>Joined</div> : <div>Join</div>}</div>
              </button>
            </div>
          </div>
          <div className="text-2xl text-primarytextcolor font-medium">
            {communityData.name}
          </div>
          <div className="text-primarytextcolor text-base font-ubuntu">
            {communityData.category}
          </div>
          <div className="text-primarytextcolor text-sm font-light">
            {communityData.description
              ? communityData.description
              : "description"}
          </div>

          <Link
            to={`/community/${communityData.name}/post`}
            className={
              "flex justify-between text-sm my-2 items-center text-primarytextcolor bg-neutral-100 px-4 py-1 rounded-full"
            }
          >
            <AddIcon sx={{ fontSize: 20 }} />
            <p>Post</p>
          </Link>

          <div className="flex justify-evenly gap-5 items-center text-sm text-primarytextcolor font-ubuntu">
            <div className="text-sm font-ubuntu font-semibold text-secondarytextcolor bg-neutral-100 px-4 py-1 rounded-full">
              Members: {communityData.membersCount}
            </div>
            <div className="text-sm font-ubuntu font-semibold text-secondarytextcolor bg-neutral-100 px-4 py-1 rounded-full">
              Posts: {communityData.postsCount}{" "}
            </div>
          </div>
        </div>
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
                        <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                          @{post.creator.username}
                        </div>

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
                        <button
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
                        </button>

                        <Link
                          to={`/post/${post.id}`}
                          className="flex bg-blue-50 rounded-lg shadow-sm px-1 justify-center items-center gap-2 cursor-pointer"
                        >
                          <ChatBubbleOutlineRoundedIcon
                            sx={{ fontSize: 18 }}
                            className="text-blue-500"
                          />
                          <div className="text-base text-blue-500">
                            {post.commentsCount}
                          </div>
                        </Link>
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
