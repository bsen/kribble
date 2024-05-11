import { useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import axios from "axios";
import { Loading } from "../Loading";
import Switch from "@mui/material/Switch";
import { BACKEND_URL } from "../../config";
import { NavBar } from "../Bars/NavBar";
export const PostCreate = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [post, setPost] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [popup, setPopup] = useState("");
  const [anonymity, setAnonymity] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (!file) {
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setPopup("File size is more than 10 mb");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setPopup("Only PNG, JPG, and JPEG files are allowed");
      return;
    }

    setPostImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost(e.target.value);
  };

  const handleClose = () => {
    setPost("");
    setPostImage(null);
    setPreviewImage("");
    history.go(-1);
  };

  const createPost = async () => {
    setPopup("");
    if (!post) {
      setPopup("Write something");
      return;
    }

    try {
      setLoadingState(true);
      const formData = new FormData();
      formData.append("anonymity", String(anonymity));
      formData.append("post", post);
      formData.append("token", token || "");
      if (postImage) {
        formData.append("image", postImage);
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/post/create-full-post`,
          formData
        );
        setPopup(response.data.message);
      } else {
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/post/create-text-post`,
          { token, post, anonymity }
        );
        setPopup(response.data.message);
      }
      setLoadingState(false);
      history.go(-1);
    } catch (error) {
      console.error("Error creating post:", error);
      setPopup("Network error");
      setLoadingState(false);
    }
  };

  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div className="h-screen border-l border-r border-neutral-100 bg-white flex justify-center items-center px-5 lg:px-0">
          <NavBar />
          <div className="w-full max-w-md my-5 rounded-lg bg-white">
            <div className="text-lg my-5 flex justify-center items-center gap-5 font-ubuntu font-medium text-center">
              <div>
                <button onClick={handleClose}>
                  <ArrowBackIcon
                    className="bg-neutral-800 p-1 rounded-full text-white"
                    sx={{ fontSize: 30 }}
                  />
                </button>
              </div>
              <div>Create Post</div>
            </div>
            <div>
              {postImage ? (
                <div className="flex justify-center items-center">
                  <button
                    onClick={() => {
                      setPostImage(null);
                    }}
                    className="absolute p-1 bg-white text-black rounded-full"
                  >
                    <DeleteIcon sx={{ fontSize: 25 }} />
                  </button>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-[50vh] h-auto rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block text-center"
                  >
                    <div className="h-20 border-dashed border border-neutral-200 rounded-lg gap-2 flex justify-center items-center">
                      <div className="text-secondarytextcolor">Add Picture</div>
                      <AddPhotoAlternateIcon className="text-secondarytextcolor" />
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
              <textarea
                value={post}
                onChange={handlePostChange}
                rows={4}
                className="w-full mt-4 border border-neutral-100 resize-none focus:outline-none px-2 py-1 text-primarytextcolor rounded-lg"
                placeholder="Write your thoughts..."
                wrap="soft"
                minLength={10}
                maxLength={300}
              />
              <div className="flex  items-center mb-2">
                <Switch
                  onClick={() => {
                    setAnonymity((prevState) => !prevState);
                  }}
                  checked={anonymity}
                />
                <label className="text-neutral-600 text-base font-ubuntu font-normal">
                  Post anonymously
                </label>
              </div>
              <div className="flex w-full justify-center">
                <button
                  onClick={createPost}
                  className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg"
                >
                  Post
                </button>
              </div>

              <div className="text-sm text-neutral-800 my-2 text-center">
                {anonymity ? (
                  <div>
                    In anonymous posts, only the content is displayed. User
                    identities remain hidden to other users.
                  </div>
                ) : (
                  <div>‎</div>
                )}
              </div>

              <div className="text-red-400 font-ubuntu font-light text-center text-sm my-2">
                {popup ? popup : <div>‎</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
