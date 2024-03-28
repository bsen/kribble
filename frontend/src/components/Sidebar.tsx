import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CircularProgress from "@mui/material/CircularProgress";
import GroupIcon from "@mui/icons-material/Group";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Link } from "react-router-dom";

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
  interface User {
    name: string;
    username: string;
    image: string;
  }
  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);

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
      setPostCreate(false);
      setLoadingState(true);
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/post/create-text-post`,
          { post }
        );
        if (response.data.status == 200) {
          alert("post created successfully");
        }
        setLoadingState(false);
        return;
      } catch (error) {
        console.log(error);
      }
    }
    setLoadingState(true);
    setPostCreate(false);
    const file = postImage;
    const formdata = new FormData();
    formdata.append("image", file ? file : "");
    formdata.append("post", post ? post : "");
    formdata.append("token", token ? token : "");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/create-full-post`,
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

  async function getMatchesDetails() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/matched-dates`,
        { token }
      );
      if (response.data.status == 200) {
        setMatchedUsers(response.data.message);
      }
    } catch (error) {}
  }

  async function logout() {
    setLoadingState(true);
    localStorage.removeItem("token");
    localStorage.removeItem("storageUser");

    setLoadingState(false);
    navigate("/login");
  }

  useEffect(() => {
    getMatchesDetails();
  }, []);

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
        <div className="h-screen w-full absolute bg-black/90 flex justify-center items-center">
          <div className="text-white text-xl font-mono">
            Do you really want to logout?
            <div className="flex justify-evenly my-5">
              <button
                onClick={logout}
                className="text-neutral-300 px-4 py-1 border border-neutral-300 rounded-lg font-thin"
              >
                YES
              </button>
              <button
                onClick={() => {
                  setLogoutState(false);
                }}
                className="text-neutral-300 px-5 py-1 border border-neutral-300 rounded-lg font-thin"
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
                    <div className="h-full p-5 gap-2 bg-white rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
                      <div className="text-neutral-700">add picture</div>
                      <AddPhotoAlternateIcon className="text-neutral-700" />
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
                  className=" border border-neutral-300 resize-none focus:outline-none p-2 text-neutral-700 rounded-lg"
                  placeholder="write your thoughts..."
                  wrap="soft"
                  minLength={10}
                  maxLength={250}
                  onChange={(e) => {
                    setPost(e.target.value);
                  }}
                />
                <button
                  onClick={createPost}
                  className="bg-black my-4  hover:bg-neutral-900 text-white border border-neutral-300 px-6 py-2 rounded-lg"
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
      <div className="h-screen bg-black border-r  border-bordercolor px-10 flex flex-col justify-between">
        <div className="h-max w-full">
          <div className="flex justify-center border-b border-bordercolor pb-2">
            <p className="text-[2.5vw] text-white font-ubuntu">kribble</p>
          </div>

          <button
            className="w-full"
            onClick={() => {
              navigate("/home");
            }}
          >
            <div
              className={
                "p-2 mt-3 flex items-center justify-center gap-2 rounded-md "
              }
            >
              <HomeIcon
                className={`${
                  location.pathname === "/home" ? "text-blue-500" : "text-logos"
                }`}
              />
              <p
                className={`text-base ${
                  location.pathname === "/home" ? "text-blue-500" : "text-logos"
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
                "p-2 mt-3 flex items-center justify-center gap-2 rounded-md "
              }
            >
              <PersonIcon
                className={`${
                  location.pathname === "/profile"
                    ? "text-blue-500"
                    : "text-logos"
                }`}
              />
              <p
                className={`text-base ${
                  location.pathname === "/profile"
                    ? "text-blue-500"
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
                "py-2 px-4 mt-3 flex items-center justify-center gap-2 rounded-md bg-black border border-neutral-800"
              }
            >
              <PostAddIcon className={"text-blue-500"} />
              <p className={"text-base text-blue-500"}>Post</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col  items-center overflow-y-auto  h-full bg-neutral-900 mt-8 rounded-xl  border border-neutral-800">
          <div
            className={
              "p-2 w-[60%] flex  items-center justify-center gap-2 border-b border-bordercolor"
            }
          >
            <GroupIcon className={"text-pink-500"} />
            <p className={"text-pink-500"}>Matches</p>
          </div>
          {matchedUsers.length > 0 ? (
            matchedUsers
              .slice()
              .reverse()
              .map((user, index) => (
                <Link to={`/user/${user.username}`} className="w-[80%]">
                  <div
                    key={index}
                    className="flex  bg-black/65 px-4 py-2 items-center justify-start rounded-xl mt-4 gap-3 border border-neutral-800"
                  >
                    <img
                      src={user.image ? user.image : "/user.png"}
                      alt="Profile"
                      className="h-8 w-8 rounded-full border border-neutral-700"
                    />
                    <p className="text-base font-light text-white">
                      {user.name}
                    </p>
                  </div>
                </Link>
              ))
          ) : (
            <p className="text-center font-mono my-2 text-white">
              No matches found
            </p>
          )}
        </div>
        <div className={"my-4 flex items-center justify-center"}>
          <button
            onClick={() => {
              setLogoutState(true);
            }}
          >
            <p className="text-logos flex gap-2 hover:text-neutral-300">
              <ExitToAppIcon />
              <p>Logout</p>
            </p>
          </button>
        </div>
      </div>
    </>
  );
};
