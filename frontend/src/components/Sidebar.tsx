import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export const Sidebar = () => {
  const api = "https://backend.undate-server.workers.dev/api/server/v1/user";
  const location = useLocation();
  const navigate = useNavigate();
  const [postCreate, setPostCreate] = useState(false);
  const [post, setPost] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const token = localStorage.getItem("token");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setPostImage(file);
  };

  async function createPost() {
    if (post.length < 10) {
      alert("post has to be minimum 10 characters");
      return;
    }
    if (postImage == null) {
      alert("set a picture");
      return;
    }

    const file = postImage;
    const formdata = new FormData();
    formdata.append("image", file ? file : "");
    formdata.append("post", post ? post : "");
    formdata.append("token", token ? token : "");
    try {
      const response = await axios.post(`${api}/post`, formdata);
      console.log(response.data.message);
      if (response.data.status === 200) {
        alert("post created");
        setPostCreate(false);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }

  return (
    <>
      {postCreate ? (
        <div className="h-screen w-full absolute bg-black/50">
          <div className="h-auto w-[30vw] absolute rounded-lg bg-gray-50 shadow-md top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
            <button
              onClick={() => {
                setPost("");
                setPostCreate(false);
              }}
            >
              <CloseIcon className="absolute -top-2 rounded-full text-gray-100 bg-gray-800 -left-2" />
            </button>
            <div className="h-full flex flex-col justify-between gap-4">
              {postImage ? (
                <div className="flex justify-center items-center w-full">
                  <img
                    src={typeof postImage === "string" ? postImage : ""}
                    alt="Profile"
                    className="h-[50%] w-[60%] rounded-lg"
                  />
                </div>
              ) : (
                <div className="px-5">
                  <label htmlFor="image-upload" className="cursor-pointer ">
                    <div className="h-full p-5 bg-white rounded-lg border border-dashed border-gray-400 flex items-center justify-center">
                      <AddPhotoAlternateIcon className="text-gray-700" />
                    </div>
                  </label>
                  <input
                    onChange={handleImageChange}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              <div className="text-end flex flex-col p-5">
                <textarea
                  rows={4}
                  className=" border border-gray-200 resize-none focus:outline-none p-2 text-gray-600 rounded-lg"
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
                  className="bg-gray-800 my-2 hover:bg-gray-900 text-white border border-gray-300 px-6 py-2 rounded-lg"
                >
                  post
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="h-screen bg-white border-r border-gray-200 w-[20%] p-4 flex flex-col justify-between">
        <div className="h-max w-full">
          <div className="w-full text-3xl font-mono text-gray-700 pb-4 text-center border-b border-gray-300">
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
                className={`${
                  postCreate ? "text-indigo-500" : "text-gray-600"
                }`}
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

        <button
          className="w-full"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          <div
            className={
              "p-2 mt-5 flex items-center justify-center gap-2 rounded-md  border border-gray-200"
            }
          >
            <ExitToAppIcon className={"text-gray-600"} />
            <p className={"text-base text-gray-600"}>Logout</p>
          </div>
        </button>
      </div>
    </>
  );
};
