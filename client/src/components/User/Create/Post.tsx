import { useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import { CircularProgress } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

export const Post = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [anonymity, setAnonymity] = useState(false);
  const [popup, setPopup] = useState("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);

        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          const xOffset = (img.width - size) / 2;
          const yOffset = (img.height - size) / 2;
          ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size);
          const compressedImageData = canvas.toDataURL("image/jpeg", 0.8);
          setPreviewImage(compressedImageData);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost(e.target.value);
  };

  const handleClose = () => {
    setPost("");
    setPreviewImage("");
    history.go(-1);
  };

  const createCommunityPost = async () => {
    setPopup("");
    if (!post) {
      setPopup("Write something");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("post", post);
      formData.append("token", token || "");
      formData.append("anonymity", String(anonymity));

      if (previewImage) {
        const fileName = "croppedImage.jpeg";
        const fileType = "image/jpeg";
        const binaryString = atob(previewImage.split(",")[1]);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: fileType });
        const file = new File([blob], fileName, { type: fileType });
        formData.append("image", file);
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/user/post/create`,
        formData
      );
      setPopup(response.data.message);
      setIsLoading(false);
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      setPopup("Network error");
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="h-screen bg-bgmain w-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }
  return (
    <>
      <div className="w-full bg-bgmain p-4 rounded-md">
        <div className="flex gap-4 items-center">
          <button onClick={handleClose}>
            <ArrowBackIcon
              className="p-1 bg-indigomain text-textmain rounded-full"
              sx={{ fontSize: 35 }}
            />
          </button>
          <div className="text-xl flex justify-center items-center gap-5 font-light bg-bgtwo px-4 rounded-md py-1 text-textmain text-center">
            <div>Create Post</div>
          </div>
        </div>
        <div className="w-full h-full rounded-lg flex flex-col justify-center">
          {previewImage ? (
            <div className="w-[100%] flex items-end justify-center bg-bgmain p-4 rounded-md">
              <div className="flex flex-col items-center">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w:w-[80%] lg:max-w-[50%] rounded-md border border-bordermain"
                />
                <button
                  onClick={() => {
                    setPreviewImage("");
                  }}
                  className="text-black mt-2 rounded-full"
                >
                  <DeleteIcon sx={{ fontSize: 25 }} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <label
                htmlFor="image-upload"
                className="cursor-pointer block text-center"
              >
                <div className="h-[5vh] w-fit rounded-md  gap-2 flex justify-center items-center">
                  <AddPhotoAlternateIcon
                    sx={{ fontSize: 30 }}
                    className="text-textmain"
                  />
                </div>
              </label>
              <input
                onChange={handleImageUpload}
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="w-full bg-bgmain my-4 rounded-md">
          <textarea
            value={post}
            onChange={handlePostChange}
            rows={3}
            className="w-full bg-bgtwo border border-bordermain overflow-auto no-scrollbar resize-none focus:outline-none px-2 py-1 text-textmain rounded-lg"
            placeholder="Write your thoughts..."
            wrap="soft"
            maxLength={250}
          />
        </div>

        <div className="flex w-full my-2 justify-between">
          <div className="flex gap-2 text-xs text-texttwo w-fit justify-center items-center">
            <div
              onClick={() => {
                setAnonymity((prevState) => !prevState);
              }}
            >
              <VisibilityOffIcon
                className={`${anonymity ? "text-textmain" : "text-texttwo"}`}
              />
            </div>
            {anonymity ? (
              <div className="text-textmain">Your identity will be hidden</div>
            ) : (
              <div className="text-texttwo">Hide your identity</div>
            )}
          </div>
          <div>
            <button
              onClick={createCommunityPost}
              className="text-textmain text-base py-1 px-6 rounded-md bg-indigomain"
            >
              Post
            </button>
          </div>
        </div>
        {popup && (
          <div className="text-red-400 font-light text-center text-xs my-2">
            {popup}
          </div>
        )}
      </div>
    </>
  );
};
