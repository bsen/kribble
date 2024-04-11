import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../config";
import { useEffect, useState } from "react";
export const PostPage = () => {
  const { postId } = useParams();
  const token = localStorage.getItem("token");
  const [comment, setComment] = useState("");
  const [postData, setPostData] = useState<{
    image: string;
    content: string;
    creatorId: string;
    createdAt: string;
    creator: {
      username: string;
      name: string;
      image: string;
    };
  }>({
    image: "",
    content: "",
    creatorId: "",
    createdAt: "",
    creator: {
      username: "",
      name: "",
      image: "",
    },
  });
  async function getPost() {
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/post/one-post-data`,
      { token, postId }
    );
    setPostData(response.data.data);
    console.log(response.data.data);
  }
  async function CreateComment() {
    console.log(comment);
    if (!comment) {
      alert("write something please");
    }
    await axios.post(`${BACKEND_URL}/api/server/v1/post/post-comment`, {
      token,
      postId,
      comment,
    });
  }

  useEffect(() => {
    getPost();
  }, []);

  return (
    <>
      <div className="flex gap-2  p-4 border-b border-neutral-200">
        <div>
          <Link to={`/${postData.creator.username}`}>
            <img
              src={
                postData.creator.image ? postData.creator.image : "/user.png"
              }
              alt="Profile"
              className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
            />
          </Link>
        </div>
        <div className="w-[80%]">
          <div className="flex gap-2 items-center">
            <Link to={`/${postData.creator.username}`}>
              <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                {postData.creator.name}
              </div>
            </Link>
            <Link to={`/${postData.creator.username}`}>
              <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                @{postData.creator.username}
              </div>
            </Link>
            <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
              · {postData.createdAt.slice(0, 10)}
            </div>
          </div>
          <div className="text-primarytextcolor text-sm lg:text-base my-2 font-light">
            {postData.content}
          </div>
          <div>
            <img
              src={postData.image}
              className="max-h-[80vh] max-w:w-[100%]  rounded-lg border border-neutral-200"
            />
          </div>
        </div>
      </div>
      <div className="p-4 border-b border-neutral-200 flex justify-center items-center">
        <div className="w-[80%]">
          <textarea
            rows={2}
            className="w-full p-2 focus:outline-none"
            wrap="soft"
            onChange={(e) => {
              setComment(e.target.value);
            }}
            maxLength={250}
            placeholder="Post a reply"
          />
          <div>
            <button
              onClick={CreateComment}
              className="text-white my-2 py-1 px-4 rounded-full bg-blue-500"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
