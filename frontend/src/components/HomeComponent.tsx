import axios from "axios";
import { BACKEND_URL } from "../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const HomeComponent = () => {
  const token = localStorage.getItem("token");
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
    const res = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/bulkposts`,
      { token }
    );
    setPostData({ posts: res.data.message });
  }

  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <div className="h-screen">
      <div className="">
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
                        post.creator.image
                          ? post.creator.image
                          : "src/assets/user.png"
                      }
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex gap-2">
                      <p className="text-white text-sm">{post.creator.name}</p>
                      <p className="text-gray-400 text-sm">
                        @{post.creator.username}
                      </p>
                    </div>
                  </div>{" "}
                </Link>
                <div className="w-ful py-4 flex flex-col items-start justify-center">
                  <img
                    src={post.image}
                    className="h-auto max-w-[50%] rounded-lg"
                  />
                  <p className="text-white my-2 font-light">{post.content}</p>
                </div>
              </div>
            ))
        ) : (
          <p className="text-center font-mono my-5 text-white">
            No posts found.
          </p>
        )}
      </div>
    </div>
  );
};
