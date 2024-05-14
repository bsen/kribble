import { useEffect, useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import { CircularProgress } from "@mui/material";

export const Post = () => {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [popup, setPopup] = useState("");
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [showPostButton, setShowPostButton] = useState(false);

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
          setShowCaptionInput(true);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    history.go(-1);
  };

  const createPost = async () => {
    setPopup("");
    if (!previewImage) {
      setPopup("Select an image");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("token", token || "");

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
      const response = await axios.post(
        `${BACKEND_URL}/api/user/post/create`,
        formData
      );
      setPopup(response.data.message);
      setIsLoading(false);
      history.go(-1);
    } catch (error) {
      console.error("Error creating post:", error);
      setPopup("Network error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (caption) {
      setShowPostButton(true);
    } else {
      setShowPostButton(false);
    }
  }, [caption]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white flex flex-col  justify-between p-4 items-center  h-screen border-l border-r border-neutral-100">
        <div className="flex gap-4 items-center">
          <button onClick={handleClose}>
            <ArrowBackIcon
              className="p-1 bg-indigo-500 text-white rounded-full"
              sx={{ fontSize: 35 }}
            />
          </button>
          <div className="text-xl flex justify-center items-center gap-5 font-light bg-indigo-50 px-4 rounded-md py-1 text-indigo-500 text-center">
            <div>Create Post</div>
          </div>
        </div>
        <div>
          {!previewImage && (
            <div>
              <label
                htmlFor="image-upload"
                className="cursor-pointer block text-center"
              >
                <div className="h-48 w-48  bg-neutral-50 shadow-sm rounded-xl border border-neutral-100  gap-2 flex justify-center items-center">
                  <AddPhotoAlternateIcon
                    sx={{ fontSize: 40 }}
                    className="text-neutral-800"
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

          <div className="my-4">
            <div className="bg-red-200">
              {previewImage && (
                <div className="w-[100%] bg-white p-4 rounded-md">
                  <div className="flex flex-col items-center">
                    <div className="flex justify-center gap-2 items-end">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w:w-[80%] lg:max-w-[50%] rounded-md border border-neutral-100"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setPreviewImage("");
                        setShowCaptionInput(false);
                        setShowPostButton(false);
                      }}
                      className="text-black mt-2 rounded-full"
                    >
                      <DeleteIcon sx={{ fontSize: 25 }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            {showCaptionInput && (
              <>
                <div className="px-4 shadow-sm bg-white  rounded-md">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    className="w-full overflow-auto no-scrollbar resize-none focus:outline-none px-2 py-1 text-primarytextcolor rounded-lg"
                    placeholder="Write some captions..."
                    wrap="soft"
                    maxLength={250}
                  />
                </div>
                <div>
                  {showPostButton && (
                    <div className="flex w-full p-2 justify-end">
                      <button
                        onClick={createPost}
                        className=" bg-indigo-500 text-white px-4 py-1 rounded-lg"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-red-400 font-light text-center text-sm my-2">
          {popup ? popup : <div>‎</div>}
        </div>
      </div>
    </>
  );
};
