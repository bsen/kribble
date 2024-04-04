import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { LoadingPage } from "../LoadingPage";
import { TopBar } from "../Mobile/TopBar";
import { BottomButtons } from "../Mobile/BottomButtons";
export const PostsHome = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [postData, setPostData] = useState<{
    posts: {
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
    }[];
  }>({
    posts: [],
  });
  async function getAllPosts() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/paginated-allposts`,
        { token }
      );
      setLoadingState(false);
      setPostData({ posts: response.data.message });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <>
      {loadingState ? (
        <LoadingPage />
      ) : (
        <>
          <TopBar />

          <div className="bg-black lg:h-screen max-lg:my-14 overflow-y-auto no-scrollbar">
            {postData.posts.length > 0 ? (
              postData.posts
                .slice()
                .reverse()
                .map((post, index) => (
                  <>
                    <div
                      key={index}
                      className="border-b border-neutral-800 p-5"
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
                              className="w-10 h-10 rounded-full"
                            />
                          </Link>
                        </div>

                        <div className="w-[80%]">
                          <div className="flex gap-2 items-center">
                            <Link to={`/${post.creator.username}`}>
                              <div className="text-white text-base hover:underline font-semibold">
                                {post.creator.name}
                              </div>
                            </Link>
                            <Link to={`/${post.creator.username}`}>
                              <div className="text-neutral-400 hover:underline text-sm font-ubuntu">
                                @{post.creator.username}
                              </div>
                            </Link>

                            <div className="text-neutral-400 text-sm font-ubuntu">
                              · {post.createdAt.slice(0, 10)}
                            </div>
                          </div>
                          <div className="text-white text-base my-2 font-light">
                            {post.content}
                          </div>
                          <div>
                            <img
                              src={post.image}
                              className="max-h-[80vh] max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-neutral-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ))
            ) : (
              <div className="text-center font-ubuntu my-5 text-white">
                No posts found.
              </div>
            )}
            <BottomButtons />
          </div>
        </>
      )}
    </>
  );
};
