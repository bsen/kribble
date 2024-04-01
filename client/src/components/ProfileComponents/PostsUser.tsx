import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
export const PostsUser = () => {
  const token = localStorage.getItem("token");
  const [userPosts, setUserPosts] = useState<{
    name: string;
    username: string;
    image: string;
    posts: {
      id: string;
      content: string;
      image: string;
      createdAt: string;
    }[];
  }>({
    name: "",
    username: "",
    image: "",
    posts: [],
  });

  async function getData() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userposts`,
        { token }
      );
      setUserPosts(response.data.message);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="w-full h-screen">
      {userPosts.posts.length > 0 ? (
        userPosts.posts
          .slice()
          .reverse()
          .map((post, index) => (
            <div key={index} className="border-b border-bordercolor p-5">
              <div className="flex gap-2">
                <div className="">
                  <img
                    src={userPosts.image ? userPosts.image : "/user.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                </div>

                <div className="w-[80%]">
                  <div className="flex gap-2 items-center">
                    <div className="text-white text-base hover:underline font-semibold">
                      {userPosts.name}
                    </div>

                    <div className="text-neutral-400 hover:underline text-sm font-ubuntu">
                      @{userPosts.username}
                    </div>

                    <div className="text-neutral-400 text-sm font-ubuntu">
                      · {post.createdAt.slice(0, 10)}
                    </div>
                  </div>
                  <div className="text-white my-2 font-light">
                    {post.content}
                  </div>
                  <div>
                    <img
                      src={post.image}
                      className="max-h-[80vh] max-w:w-[100%] lg:max-w-[80%] rounded-lg border border-bordercolor"
                    />
                  </div>
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
  );
};
