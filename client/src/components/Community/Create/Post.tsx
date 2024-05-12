import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Loading } from "../../Loading";
import Switch from "@mui/material/Switch";
import { BACKEND_URL } from "../../../config";

export const Post = () => {
  const { name } = useParams();
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
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
      setLoadingState(true);
      const formData = new FormData();
      formData.append("post", post);
      formData.append("communityName", name || "");
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
        `${BACKEND_URL}/api/community/post/create`,
        formData
      );
      setPopup(response.data.message);
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
        <div className="h-screen border-l border-r border-neutral-100 bg-white flex flex-col justify-center items-center">
          <div className="flex gap-4 items-center mt-5">
            <button onClick={handleClose}>
              <ArrowBackIcon
                className="p-1 bg-indigo-600 text-white rounded-full"
                sx={{ fontSize: 35 }}
              />
            </button>
            <div className="text-xl flex justify-center items-center gap-5 font-light bg-indigo-50 px-4 rounded-md py-1 text-indigo-600 text-center">
              <div>Create Post in {name}</div>
            </div>
          </div>
          <div className="w-full px-2 h-full max-w-md my-5 rounded-lg flex flex-col justify-center">
            {previewImage ? (
              <div className="flex justify-center items-center">
                <button
                  onClick={() => {
                    setPreviewImage("");
                  }}
                  className="absolute p-1 bg-white text-black rounded-full"
                >
                  <DeleteIcon sx={{ fontSize: 25 }} />
                </button>
                <img
                  src={previewImage}
                  alt="Preview"
                  className=" h-auto rounded-lg border border-neutral-100"
                />
              </div>
            ) : (
              <div className="flex justify-end w-full">
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block text-center"
                >
                  <div className="font-light w-fit px-4 py-1 text-base rounded-lg gap-2 flex justify-center items-center">
                    <AddPhotoAlternateIcon
                      sx={{ fontSize: 25 }}
                      className="text-neutral-600"
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

            <textarea
              value={post}
              onChange={handlePostChange}
              rows={2}
              className="w-full mb-4  resize-none focus:outline-none px-2 py-1 text-primarytextcolor rounded-lg"
              placeholder="Write your thoughts..."
              wrap="soft"
              maxLength={250}
            />
            <div className="flex w-full items-center">
              <Switch
                color="default"
                onClick={() => {
                  setAnonymity((prevState) => !prevState);
                }}
                checked={anonymity}
              />
              <label className="text-neutral-600 text-sm font-normal">
                Post anonymously
              </label>
            </div>
            <div className="my-4">
              <div className="text-xs text-neutral-600 text-center">
                {anonymity ? (
                  <div>
                    We prioritize your privacy by keeping user identities
                    hidden. Let's maintain a safe space by refraining from
                    inappropriate posts. Remember, violating company policy may
                    have consequences.
                  </div>
                ) : (
                  ""
                )}
              </div>

              {popup ? (
                <div className="text-red-400 font-light text-center text-xs my-2">
                  {popup}
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="flex w-full justify-center">
              <button
                onClick={createCommunityPost}
                className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
