import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export const Sidebar = () => {
  const api = "http://localhost:8787/api/server/v1/user";
  const location = useLocation();
  const navigate = useNavigate();
  const [postCreate, setPostCreate] = useState(false);
  const [post, setPost] = useState("");
  const token = localStorage.getItem("token");
  async function createPost() {
    console.log(post);
    if (post.length < 10) {
      alert("post has to be minimum 10 characters");
      return;
    }
    try {
      const response = await axios.post(`${api}/post`, { post, token });
      console.log(response.data.message);
      if (response.data.status == 200) {
        alert("post created");
        setPostCreate(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {postCreate ? (
        <div className="h-screen w-full absolute bg-black/50">
          <div className="absolute px-5 h-[30vh] w-[40vw] rounded-lg bg-gray-50 shadow-md top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
              onClick={() => {
                setPostCreate(false);
              }}
            >
              <CloseIcon className="absolute -top-2 rounded-full text-gray-100 bg-black -left-2" />
            </button>
            <div className="text-end">
              <textarea
                rows={4}
                className="w-full border border-gray-200 resize-none focus:outline-none p-2 text-gray-600 rounded-lg"
                placeholder="write your thoughts..."
                wrap="soft"
                minLength={10}
                maxLength={200}
                onChange={(e) => {
                  setPost(e.target.value);
                }}
              />
              <button
                onClick={createPost}
                className="bg-gray-800 my-2 hover:bg-gray-900 text-white border border-gray-300 px-4 py-1 rounded-lg"
              >
                post
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="h-screen bg-white border-r border-gray-200 w-[20%] px-4">
        <div className="w-full text-3xl font-mono text-gray-700 p-4 text-center border-b border-gray-300">
          undate
        </div>
        <button
          className="w-full"
          onClick={() => {
            navigate("/home");
          }}
        >
          <div
            className={`p-2 mt-5 flex items-center justify-center gap-2 rounded-md ${
              location.pathname === "/home"
                ? "bg-indigo-50"
                : "border border-gray-200"
            }`}
          >
            <HomeIcon
              className={`${
                location.pathname === "/home"
                  ? "text-indigo-500"
                  : "text-gray-600"
              }`}
            />
            <p
              className={`text-base ${
                location.pathname === "/home"
                  ? "text-indigo-500"
                  : "text-gray-600"
              }`}
            >
              Home
            </p>
          </div>
        </button>
        <button
          className="w-full"
          onClick={() => {
            navigate("/profile");
          }}
        >
          <div
            className={`p-2 mt-5 flex items-center justify-center gap-2 rounded-md ${
              location.pathname === "/profile"
                ? "bg-indigo-50"
                : "border border-gray-200"
            }`}
          >
            <PersonIcon
              className={`${
                location.pathname === "/profile"
                  ? "text-indigo-500"
                  : "text-gray-600"
              }`}
            />
            <p
              className={`text-base ${
                location.pathname === "/profile"
                  ? "text-indigo-500"
                  : "text-gray-600"
              }`}
            >
              Profile
            </p>
          </div>
        </button>
        <button
          className="w-full"
          onClick={() => {
            setPostCreate(true);
          }}
        >
          <div
            className={`p-2 mt-5 flex items-center justify-center gap-2 rounded-md ${
              postCreate ? "bg-indigo-50" : "border border-gray-200"
            }`}
          >
            <PostAddIcon
              className={`${postCreate ? "text-indigo-500" : "text-gray-600"}`}
            />
            <p
              className={`text-base ${
                postCreate ? "text-indigo-500" : "text-gray-600"
              }`}
            >
              Post
            </p>
          </div>
        </button>
      </div>
    </>
  );
};
