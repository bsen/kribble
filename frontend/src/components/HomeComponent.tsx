import axios from "axios";
import { BACKEND_URL } from "../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

export const HomeComponent = () => {
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
    }[];
  }>({
    posts: [],
  });

  async function getAllPosts() {
    setLoadingState(true);
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/post/paginated-allposts`,
      { token }
    );
    setPostData({ posts: response.data.message });
    localStorage.setItem("storageUser", response.data.user);
    setLoadingState(false);
  }

  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <>
      {loadingState ? (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="h-screen bg-black border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
          {postData.posts.length > 0 ? (
            postData.posts
              .slice()
              .reverse()
              .map((post, index) => (
                <div
                  key={index}
                  className="py-4 p-10  border-b border-bordercolor"
                >
                  <Link to={`/user/${post.creator.username}`}>
                    <div className="flex gap-2 items-center">
                      <img
                        src={
                          post.creator.image ? post.creator.image : "/user.png"
                        }
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-neutral-800"
                      />
                      <div className="flex gap-2">
                        <div className="text-white text-sm">
                          {post.creator.name}
                        </div>
                        <div className="text-neutral-400 text-sm">
                          @{post.creator.username}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="w-ful py-4 flex flex-col items-start justify-center">
                    <img
                      src={post.image}
                      className="h-auto w-[70%] rounded-lg"
                    />
                    <div className="text-white my-2 font-light">
                      {post.content}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center font-ubuntu my-5 text-white">
              No posts found.
            </div>
          )}
        </div>
      )}
    </>
  );
};
