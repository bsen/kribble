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
import { EditCommunity } from "./EditCommunity";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Loading } from "../Loading";
interface CommunityData {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
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
  const [loadingState, setLoadingState] = useState(false);
  const [isCreator, setIsCreator] = useState(Boolean);
  const [isJoined, setIsJoined] = useState(false);
  const [communityPostDeletionState, setCommunityPostDeletionState] =
    useState(false);
  const [deletingPostId, setDeletingPostId] = useState("");
  const [communityEditingState, setCommunityEditingState] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityData>({
    id: "",
    name: "",
    image: "",
    description: "",
    category: "",
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
      setLoadingState(true);
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/community/one-community-data`,
        { token, name }
      );
      setLoadingState(false);
      setCommunityData(response.data.data);
      setIsCreator(response.data.creator);
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
      setLoadingState(true);
      await axios.post(
        `${BACKEND_URL}/api/server/v1/community/join-leave-community`,
        { token, name }
      );
      getCommunityData();
      setLoadingState(false);
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

  const deleteCommunityPost = async () => {
    setLoadingState(true);
    const id = communityData.id;
    await axios.post(
      `${BACKEND_URL}/api/server/v1/community/delete-community-post`,
      { token, id, deletingPostId }
    );
    setDeletingPostId("");
    setCommunityPostDeletionState(false);
    setLoadingState(false);
    window.location.reload();
  };

  const parentToChild = (
    id: string,
    name: string,
    image: string,
    description: string,
    category: string,
    membersCount: string,
    postsCount: string
  ) => {
    setCommunityData({
      id,
      name,
      image,
      description,
      category,
      membersCount,
      postsCount,
    });
  };
  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div className="h-screen flex flex-col">
          {communityPostDeletionState ? (
            <div className="w-full h-screen flex justify-center items-center">
              <div className="flex flex-col gap-4 text-base  items-center font-ubuntu font-semibold">
                Do you really want to delete the post
                <div className="text-xs font-light text-neutral-600">
                  note you can not get back the deleted item!
                </div>
                <div className="flex gap-5">
                  <button
                    onClick={deleteCommunityPost}
                    className="text-white bg-red-500 hover:bg-red-400 font-semibold px-4 py-1  rounded-full"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setDeletingPostId("");
                      setCommunityPostDeletionState(false);
                    }}
                    className="text-black bg-background hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="h-screen overflow-y-auto no-scrollbar py-14"
              onScroll={handleScroll}
              ref={scrollContainerRef}
            >
              <SearchBox />
              {communityEditingState ? (
                <div className="absolute w-full lg:w-[45%]">
                  <EditCommunity communityData={communityData} />
                </div>
              ) : (
                <div className="w-full p-4 flex flex-col items-start border-b border-neutral-200">
                  <div className="flex justify-between w-full items-start">
                    <img
                      src={communityData.image || "/group.png"}
                      alt={communityData.name}
                      className="w-24 rounded-full borderßborder-neutral-50 mb-2"
                    />

                    <div>
                      {isCreator ? (
                        <button
                          onClick={() => {
                            parentToChild(
                              communityData.id,
                              communityData.name,
                              communityData.image,
                              communityData.description,
                              communityData.category,
                              communityData.membersCount,
                              communityData.postsCount
                            );
                            setCommunityEditingState(true);
                          }}
                          className="text-left text-white bg-primarytextcolor font-ubuntu font-light rounded-full px-3 py-1 text-sm"
                        >
                          Edit profile
                        </button>
                      ) : (
                        <button
                          onClick={handleJoinCommunity}
                          className="text-left text-white bg-primarytextcolor font-ubuntu font-light rounded-full px-3 py-1 text-sm"
                        >
                          <div>
                            {isJoined ? <div>Joined</div> : <div>Join</div>}
                          </div>
                        </button>
                      )}
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
              )}

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
                          <div className="w-[90%]">
                            <div className="flex justify-between items-center">
                              <Link to={`/${post.creator.username}`}>
                                <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                                  {post.creator.name}
                                </div>
                              </Link>
                              {isCreator ? (
                                <button
                                  onClick={() => {
                                    setDeletingPostId(post.id);
                                    setCommunityPostDeletionState(true);
                                  }}
                                >
                                  <MoreVertIcon
                                    sx={{ fontSize: 20 }}
                                    className="text-neutral-600"
                                  />
                                </button>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="flex mb-2 gap-2 items-center">
                              <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                                @{post.creator.username}
                              </div>

                              <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                                · {post.createdAt.slice(0, 10)}
                              </div>
                            </div>
                            <div className="text-primarytextcolor mb-2 text-sm lg:text-base font-light">
                              {post.content}
                            </div>
                            {post.image && (
                              <img
                                src={post.image}
                                className="max-h-[80vh] mb-2 max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-neutral-200"
                              />
                            )}

                            <div className="flex  justify-start gap-5 items-center text-sm text-neutral-500">
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
          )}
        </div>
      )}
    </>
  );
};
