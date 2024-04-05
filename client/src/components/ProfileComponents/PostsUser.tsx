import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
import { useParams } from "react-router-dom";
export const PostsUser = () => {
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
  const { username } = useParams();
  const token = localStorage.getItem("token");
  async function getData() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/posts`,
        { token, username }
      );
      setUserPosts(response.data.message);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    console.log(userPosts);
    getData();
  }, []);
  return (
    <div>
      {userPosts.posts.length > 0 ? (
        userPosts.posts.map((post, index) => (
          <div key={index} className="border-b border-neutral-200 p-2 lg:p-5">
            <div className="flex gap-2">
              <div>
                <img
                  src={userPosts.image ? userPosts.image : "/user.png"}
                  alt="Profile"
                  className="h-8 w-8 lg:w-10 lg:h-10 rounded-full"
                />
              </div>

              <div className="w-[80%]">
                <div className="flex gap-2 items-center">
                  <div className="text-primarytextcolor  text-sm lg:text-base hover:underline font-semibold">
                    {userPosts.name}
                  </div>

                  <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                    @{userPosts.username}
                  </div>

                  <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                    · {post.createdAt.slice(0, 10)}
                  </div>
                </div>
                <div className="text-primarytextcolor my-2  text-sm lg:text-base font-light">
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
        <div className=" text-center font-ubuntu my-5 text-primarytextcolor">
          No posts found.
        </div>
      )}
    </div>
  );
};
