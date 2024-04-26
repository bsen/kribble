import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SettingsIcon from "@mui/icons-material/Settings";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { Loading } from "../Loading";
import { EditProfile } from "./EditProfile";
import { BottomButtons } from "../Mobile/BottomButtons";
import { BACKEND_URL } from "../../config";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  creatorId: string;
  postId: string;
}

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
}

export const ProfileSection: React.FC = () => {
  const [loadingState, setLoadingState] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    image: string;
    bio: string;
    website: string;
    interest: string;
    followers: {
      followerId: string;
      followingId: string;
    }[];
    following: {
      followerId: string;
      followingId: string;
    }[];
  }>({
    name: "",
    username: "",
    image: "",
    bio: "",
    website: "",
    interest: "",
    followers: [],
    following: [],
  });
  const [postComponent, setPostComponent] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  const [followingState, setFollowingState] = useState(false);
  const [profileEditingState, setProfileEditingState] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [postDeleteId, setPostDeleteId] = useState("");
  const [deleteState, setDeleteState] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [postId, setPostId] = useState("");
  const [commentDeleteId, setCommentDeleteId] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { username } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    getData();
    getAllPosts(null, true);
    getComments();
  }, [username]);

  async function getData() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token, username }
      );
      setUserData(response.data.message);
      setCurrentUser(response.data.currentUser);
      setFollowingState(response.data.following);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function getAllPosts(
    cursor: string | null | undefined,
    truncate: boolean
  ) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/posts`,
        { token, cursor, username }
      );
      setPostData((prevData) => ({
        posts: truncate
          ? [...response.data.message]
          : [...prevData.posts, ...response.data.message],
        nextCursor: response.data.nextCursor,
      }));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function getComments(cursor?: string) {
    try {
      setIsLoadingComments(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/comments`,
        {
          token,
          cursor,
        }
      );
      if (cursor) {
        setComments((prevComments) => [
          ...prevComments,
          ...response.data.message,
        ]);
      } else {
        setComments(response.data.message);
      }
      setIsLoadingComments(false);
    } catch (error) {
      console.error(error);
      setIsLoadingComments(false);
    }
  }

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      postData.nextCursor &&
      !isLoading
    ) {
      getAllPosts(postData.nextCursor, false);
    }
  };

  async function followUser() {
    setLoadingState(true);
    try {
      const details = { username, token };
      await axios.post(
        `${BACKEND_URL}/api/server/v1/user/follow-unfollow`,
        details
      );

      await getData();
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function deletePost() {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/server/v1/post/delete-post`, {
        token,
        postDeleteId,
      });
      setDeleteState(false);
      setPostDeleteId("");
      window.location.reload();
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteComment() {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/server/v1/post/delete-comment`, {
        token,
        commentDeleteId: commentDeleteId,
        postId,
      });
      setLoadingState(false);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div className="h-screen flex flex-col">
          {deleteState ? (
            <div className="w-full h-screen flex justify-center items-center">
              <div className="flex flex-col gap-4 text-base  items-center font-ubuntu font-semibold">
                Do you really want to delete the
                {postDeleteId ? " post" : " comment"} ?
                <span className="text-xs font-light text-neutral-600">
                  note you can not get back the deleted item!
                </span>
                <div className="flex gap-5">
                  <button
                    onClick={postDeleteId ? deletePost : deleteComment}
                    className="text-white bg-red-500 hover:bg-red-400 font-semibold px-4 py-1  rounded-full"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setDeleteState(false);
                      setPostDeleteId("");
                      setCommentDeleteId("");
                      setPostId("");
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
              className="flex-1 overflow-y-auto no-scrollbar max-lg:mb-14"
              onScroll={handleScroll}
              ref={scrollContainerRef}
            >
              {profileEditingState ? (
                <div className="absolute w-full lg:w-[45%]">
                  <EditProfile />
                </div>
              ) : (
                <div className="px-5 py-2 border-b border-neutral-200">
                  <div className="flex justify-between items-center">
                    <div className="flex  items-center gap-4">
                      <img
                        src={userData.image ? userData.image : "/user.png"}
                        alt="Profile"
                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-full"
                      />
                      <div>
                        <div className="text-lg lg:text-xl font-semibold text-primarytextcolor">
                          {userData.name}
                        </div>
                        <div className="text-sm text-secondarytextcolor font-light">
                          @{userData.username}
                        </div>
                      </div>
                    </div>
                    {currentUser === username ? (
                      <button
                        onClick={() => {
                          setProfileEditingState(true);
                        }}
                      >
                        <SettingsIcon />
                      </button>
                    ) : (
                      <div className="flex gap-4 justify-between items-center">
                        <button
                          onClick={followUser}
                          className="bg-blue-500 text-background px-4 py-1 rounded-lg font-ubuntu"
                        >
                          <div>
                            {followingState ? (
                              <div>Unfollow</div>
                            ) : (
                              <div>Follow</div>
                            )}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="my-2">
                    <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                      {userData.bio ? userData.bio : "bio"}
                    </div>
                    <div className="">
                      <div className="text-sm text-blue-500 font-light hover:underline">
                        <a
                          href={`${
                            userData.website &&
                            (userData.website.startsWith("http://") ||
                              userData.website.startsWith("https://"))
                              ? userData.website
                              : "https://" +
                                (userData.website
                                  ? userData.website
                                  : "www.kribble.net")
                          }`}
                          target="_blank"
                        >
                          {userData.website ? userData.website : "website"}{" "}
                          <OpenInNewIcon sx={{ fontSize: 15 }} />
                        </a>
                      </div>
                      <div className="text-sm text-secondarytextcolor font-light">
                        {userData.interest ? userData.interest : "interests"}
                      </div>
                    </div>
                    <div className="flex gap-4 my-2 font-ubuntu text-sm">
                      <Link to={`/followers/${username}`}>
                        <div className="flex gap-2 items-center">
                          <div className="text-primarytextcolor">
                            {userData.followers.length}
                          </div>
                          <div className="text-secondarytextcolor">
                            Followers
                          </div>
                        </div>
                      </Link>
                      <Link to={`/following/${username}`}>
                        <div className="flex gap-2 items-center">
                          <div className="text-primarytextcolor">
                            {userData.following.length}
                          </div>
                          <div className="text-secondarytextcolor">
                            Following
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="flex justify-start items-center gap-4">
                      <button
                        onClick={() => {
                          setPostComponent(true);
                        }}
                        className={`text-sm font-ubuntu font-semibold ${
                          postComponent
                            ? "text-blue-500"
                            : "text-secondarytextcolor"
                        }`}
                      >
                        Posts
                      </button>
                      <button
                        onClick={() => {
                          setPostComponent(false);
                        }}
                        className={`text-sm font-ubuntu font-semibold ${
                          postComponent
                            ? "text-secondarytextcolor"
                            : "text-blue-500"
                        }`}
                      >
                        Comments
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {postComponent ? (
                <div>
                  {postData.posts.length > 0 ? (
                    postData.posts.map((post, index) => (
                      <div
                        key={index}
                        className="border-b border-neutral-200 p-3"
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
                              <div className="flex gap-2 items-center">
                                <Link to={`/${post.creator.username}`}>
                                  <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                                    {post.creator.name}
                                  </div>
                                </Link>
                                <Link to={`/${post.creator.username}`}>
                                  <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                                    @{post.creator.username}
                                  </div>
                                </Link>
                                <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                                  · {post.createdAt.slice(0, 10)}
                                </div>
                                <div className="text-neutral-600">
                                  <button
                                    onClick={() => {
                                      setDeleteState(true);
                                      setPostDeleteId(post.id);
                                    }}
                                  >
                                    <MoreVertIcon />
                                  </button>
                                </div>
                              </div>
                              <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                                {post.content}
                              </div>
                              <div>
                                <img
                                  src={post.image}
                                  className="max-h-[80vh] mt-2 max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-neutral-200"
                                />
                              </div>
                              <div>
                                <div className="flex gap-2 text-neutral-600"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end text-sm text-neutral-500">
                            <Link to={`/post/${post.id}`}>
                              <ChatBubbleOutlineRoundedIcon
                                sx={{ fontSize: 17 }}
                              />
                            </Link>
                            <div>{post.commentsCount}</div>
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
              ) : (
                <div>
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-b border-neutral-200 p-4 hover:bg-neutral-50"
                      >
                        <div className="flex flex-col gap-2 ">
                          <div className="text-primarytextcolor w-max flex items-center justify-between gap-2 text-sm font-light">
                            <Link to={`/post/${comment.postId}`}>
                              <OpenInNewIcon
                                sx={{ fontSize: 20 }}
                                className="text-blue-500"
                              />
                            </Link>
                            {comment.createdAt.slice(0, 10)}{" "}
                            <div className="text-neutral-600">
                              <button
                                onClick={() => {
                                  setCommentDeleteId(comment.id);
                                  setPostId(comment.postId);
                                  setDeleteState(true);
                                }}
                              >
                                <MoreVertIcon sx={{ fontSize: 18 }} />
                              </button>
                            </div>
                          </div>
                          <div className="text-primarytextcolor  text-sm lg:text-base font-light">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center font-ubuntu my-5 text-primarytextcolor">
                      No Comments found.
                    </div>
                  )}
                  {isLoadingComments && (
                    <div className="text-center my-5 text-gray-500">
                      Loading ...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-center my-5">
              <CircularProgress />
            </div>
          )}
        </div>
      )}
      <BottomButtons />
    </>
  );
};
