import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CircularProgress from "@mui/material/CircularProgress";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);

  const [postCreate, setPostCreate] = useState(false);
  const [post, setPost] = useState("");
  const [logoutState, setLogoutState] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const token = localStorage.getItem("token");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setPostImage(file);
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
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
    setPostCreate(false);
    setLoadingState(true);
    const file = postImage;
    const formdata = new FormData();
    formdata.append("image", file ? file : "");
    formdata.append("post", post ? post : "");
    formdata.append("token", token ? token : "");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/post`,
        formdata
      );

      if (response.data.status === 200) {
        alert("post created");
      } else {
        alert("network error");
      }

      setLoadingState(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }

  return (
    <>
      {loadingState ? (
        <div className="h-screen w-full absolute bg-black/70 flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        ""
      )}

      {logoutState ? (
        <div className="h-screen w-full absolute bg-black/80 flex justify-center items-center">
          <div className="text-white text-xl font-mono">
            Do you really want to logout?
            <div className="flex justify-evenly my-5">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="text-gray-400 px-4 py-1 border border-gray-400 rounded-lg font-thin"
              >
                YES
              </button>
              <button
                onClick={() => {
                  setLogoutState(false);
                }}
                className="text-indigo-300 px-5 py-1 border border-indigo-300 rounded-lg font-thin"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {postCreate ? (
        <div className="h-screen w-full absolute bg-black/70">
          <div className="h-auto w-[30vw] absolute rounded-lg bg-white shadow-md top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
            <button
              onClick={() => {
                setPost("");
                setPostImage(null);
                setPreviewImage("");
                setPostCreate(false);
              }}
            >
              <CloseIcon className="absolute -top-5 -left-5 text-white" />
            </button>
            <div className="h-full flex flex-col justify-between">
              {postImage ? (
                <div className="flex justify-center items-center w-full">
                  <img
                    src={previewImage ? previewImage : ""}
                    alt="Profile"
                    className="max-h-[40vh] max-w-[80%] rounded-lg"
                  />
                </div>
              ) : (
                <div className="px-5">
                  <label htmlFor="image-upload" className="cursor-pointer ">
                    <div className="h-full p-5 bg-white rounded-lg border border-dashed border-gray-400 flex items-center justify-center">
                      <AddPhotoAlternateIcon className="text-black" />
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
                  className=" border border-gray-300 resize-none focus:outline-none p-2 text-gray-700 rounded-lg"
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
                  className="bg-black my-4  hover:bg-gray-900 text-white border border-gray-300 px-6 py-2 rounded-lg"
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
      <div className="h-screen bg-black w-[30%] px-10 flex flex-col justify-between">
        <div className="h-max w-full">
          <div className="w-full text-3xl font-mono text-gray-200 p-4 text-center border-b border-bordercolor">
            undate
          </div>
          <button
            className="w-full"
            onClick={() => {
              navigate("/home");
            }}
          >
            <div
              className={
                "p-2 mt-5 flex items-center justify-center gap-2 rounded-md "
              }
            >
              <HomeIcon
                className={`${
                  location.pathname === "/home"
                    ? "text-indigo-500"
                    : "text-logos"
                }`}
              />
              <p
                className={`text-base ${
                  location.pathname === "/home"
                    ? "text-indigo-500"
                    : "text-logos"
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
              className={
                "p-2 mt-5 flex items-center justify-center gap-2 rounded-md "
              }
            >
              <PersonIcon
                className={`${
                  location.pathname === "/profile"
                    ? "text-indigo-500"
                    : "text-logos"
                }`}
              />
              <p
                className={`text-base ${
                  location.pathname === "/profile"
                    ? "text-indigo-500"
                    : "text-logos"
                }`}
              >
                Profile
              </p>
            </div>
          </button>
          <button
            className="w-full flex justify-center"
            onClick={() => {
              setPostCreate(true);
            }}
          >
            <div
              className={
                "p-2 mt-5 flex items-center justify-center gap-2 rounded-md bg-gray-200 w-[50%]"
              }
            >
              <PostAddIcon className={"text-indigo-800"} />
              <p className={"text-base text-indigo-800"}>Post</p>
            </div>
          </button>
        </div>

        <button
          onClick={() => {
            setLogoutState(true);
          }}
          className="w-full"
        >
          <div
            className={
              "p-2 my-6 flex items-center justify-center gap-2 rounded-md"
            }
          >
            <ExitToAppIcon className={"text-logos"} />
            <p className={"text-base text-logos"}>Logout</p>
          </div>
        </button>
      </div>
    </>
  );
};
