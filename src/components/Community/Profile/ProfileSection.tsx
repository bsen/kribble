import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { CircularProgress } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";
import AddIcon from "@mui/icons-material/Add";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";

interface CommunityData {
  id: string;
  name: string;
  image: string;
  description: string;
  membersCount: string;
  postsCount: string;
}
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
export const ProfileSection: React.FC = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [isCreator, setIsCreator] = useState(Boolean);
  const [deleteState, setDeleteState] = useState(false);
  const [postDeleteId, setPostDeleteId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isJoiningLoading, setIsJoiningLoading] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityData>({
    id: "",
    name: "",
    image: "",
    description: "",
    membersCount: "",
    postsCount: "",
  });
  const getCommunityData = async () => {
    try {
      setLoadingState(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/community/profile/data`,
        { token, name }
      );
      if (!response.data.data) {
        setError(new Error("Community not found"));
      } else {
        setCommunityData(response.data.data);
        setIsCreator(response.data.creator);
        setIsJoined(response.data.joined);
      }
      setLoadingState(false);
    } catch (error: any) {
      setError(error as Error);
      setLoadingState(false);
    }
  };

  useEffect(() => {
    getCommunityData();
  }, []);

  const handleJoinCommunity = async () => {
    try {
      setIsJoiningLoading(true);
      setIsJoined((prevState) => !prevState);
      setCommunityData((prevData) => ({
        ...prevData,
        membersCount: isJoined
          ? (parseInt(prevData.membersCount) - 1).toString()
          : (parseInt(prevData.membersCount) + 1).toString(),
      }));

      const details = { token, name };
      await axios.post(`${BACKEND_URL}/api/community/join/join/leave`, details);
    } catch (error) {
      setError(error as Error);
      setIsJoined((prevState) => !prevState);
      setCommunityData((prevData) => ({
        ...prevData,
        membersCount: isJoined
          ? (parseInt(prevData.membersCount) + 1).toString()
          : (parseInt(prevData.membersCount) - 1).toString(),
      }));
    } finally {
      setIsJoiningLoading(false);
    }
  };

  const navigateToEditCommunity = useCallback(() => {
    navigate(`/edit/community/${communityData.name}`, {
      state: { communityData },
    });
  }, [navigate, communityData]);

  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getAllPosts(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/post/all/posts`,
        { token, cursor, name }
      );
      setPostData({
        posts: [...postData.posts, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      setError(error as Error);
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

  const deleteCommunityPost = async () => {
    setLoadingState(true);
    const communityId = communityData.id;
    await axios.post(`${BACKEND_URL}/api/community/post/delete`, {
      token,
      communityId,
      postDeleteId,
    });
    setPostDeleteId("");
    setDeleteState(false);
    setLoadingState(false);
    window.location.reload();
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

  if (loadingState) {
    return (
      <div className="w-full mt-14 flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-normal">
        {error.message}
      </div>
    );
  }
  if (deleteState) {
    return (
      <div className="w-full bg-black h-screen flex justify-center items-center">
        <div className="flex text-light text-center flex-col gap-6 text-base items-center font-ubuntu font-normal">
          Do you really want to delete the post ?
          <br />
          Note that you can not get back the deleted post
          <div className="flex gap-5">
            <button
              onClick={deleteCommunityPost}
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
      <div
        className="h-screen overflow-y-auto no-scrollbar py-12 "
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />

        <div className="p-3 mt-3 rounded-lg border border-semidark bg-dark">
          <div className="flex justify-between w-full items-center gap-2">
            <img
              src={communityData.image ? communityData.image : "/group.png"}
              className="lg:w-20 lg:h-20 w-16 h-16 rounded-lg border border-semidark"
            />
            <div className="w-full">
              <div className="flex justify-end items-center">
                <div>
                  {isCreator && (
                    <button
                      onClick={navigateToEditCommunity}
                      className="text-left text-semilight bg-indigomain font-light rounded-lg px-4 py-0.5 text-sm"
                    >
                      Edit
                    </button>
                  )}

                  {!isCreator && (
                    <button
                      onClick={handleJoinCommunity}
                      disabled={isJoiningLoading}
                      className="text-left flex justify-center items-center text-semilight bg-indigomain font-light rounded-lg w-16 py-0.5 text-sm"
                    >
                      <div className="flex items-center justify-center">
                        {isJoiningLoading ? (
                          <CircularProgress
                            size="20px"
                            sx={{ color: "rgb(50 50 50);" }}
                          />
                        ) : (
                          <div>
                            {isJoined ? <div>Joined</div> : <div>Join</div>}
                          </div>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              </div>
              <div className="text-lg lg:text-xl font-normal text-light">
                {communityData.name}
              </div>
              <div className="flex text-light items-center gap-2 font-light text-sm">
                <div className="flex gap-1 items-center">
                  {communityData.membersCount} Members
                </div>
                <div className="flex gap-1 items-center">
                  {communityData.postsCount} Posts
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm my-2 text-light font-light">
            {communityData.description
              ? communityData.description
              : "description"}
          </div>

          <div
            className="w-fit flex justify-start items-center"
            onClick={() => {
              navigate(`/${communityData.name}/create/post`);
            }}
          >
            <div
              className={
                "flex w-fit justify-between text-sm items-center text-semilight font-light bg-indigomain px-4 py-1 rounded-lg"
              }
            >
              <AddIcon sx={{ fontSize: 20 }} />
              <p>Post</p>
            </div>
          </div>
        </div>

        <div>
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
                        {post.anonymity ? (
                          <img
                            src="/mask.png"
                            alt="Profile"
                            className="w-7 h-7 rounded-lg"
                          />
                        ) : (
                          <img
                            src={
                              post.creator.image
                                ? post.creator.image
                                : "/user.png"
                            }
                            alt="Profile"
                            className="w-7 h-7 rounded-lg"
                          />
                        )}
                      </div>
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
                    <div>
                      {isCreator && (
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
