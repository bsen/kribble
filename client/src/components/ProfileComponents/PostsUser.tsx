import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import { ProfileSection } from "./ProfileSection";
import { Matches } from "../MatchMaker/Matches";
import { BottomButtons } from "../Mobile/BottomButtons";

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
}

export const PostsUser = () => {
  const { username } = useParams();
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
        `${BACKEND_URL}/api/server/v1/user/posts`,
        { token, cursor, username }
      );
      setPostData({
        posts: [...postData.posts, ...response.data.message],
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
  const [copm, setComp] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  useEffect(() => {
    User();
  }, []);
  async function User() {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/user`,
        { token }
      );
      setCurrentUser(response.data.message.username);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
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
      getAllPosts(postData.nextCursor);
    }
  };

  return (
    <>
      <div className="h-screen flex flex-col">
        <div
          className="flex-1 overflow-y-auto no-scrollbar mb-14"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          <ProfileSection />
          <div className="flex gap-5 px-5 pb-2 border-b border-neutral-200">
            <button
              onClick={() => {
                setComp(true);
              }}
            >
              <div className="text-blue-500 text-base font-ubuntu font-semibold">
                Posts
              </div>
            </button>
            {currentUser === username ? (
              <button
                onClick={() => {
                  setComp(false);
                }}
              >
                <div className="text-pink-500 text-base font-ubuntu font-semibold">
                  Matches
                </div>
              </button>
            ) : (
              ""
            )}
          </div>
          {copm ? (
            <div>
              {postData.posts.length > 0 ? (
                postData.posts.map((post, index) => (
                  <div
                    key={index}
                    className="border-b border-neutral-200 p-2 lg:p-5"
                  >
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
                        </div>
                        <div className="text-primarytextcolor text-sm lg:text-base my-2 font-light">
                          {post.content}
                        </div>
                        <div>
                          <img
                            src={post.image}
                            className="max-h-[80vh] max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-neutral-200"
                          />
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
          ) : (
            <div>
              {currentUser === username ? <Matches /> : "" + setComp(true)}
            </div>
          )}

          {isLoading && (
            <div className="text-center my-5">
              <CircularProgress />
            </div>
          )}
        </div>
        <BottomButtons />
      </div>
    </>
  );
};
