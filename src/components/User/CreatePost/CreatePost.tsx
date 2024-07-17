import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { BACKEND_URL } from "../../../config";
import { MenuBar } from "../../Menu/MenuBar";
import { UserContext } from "../Context/UserContext";

export const CreatePost = ({}) => {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("File size should be under 15 MB.");
      return;
    }

    if (file.type.startsWith("image/")) {
      await handleImageUpload(file);
    } else if (file.type === "video/mp4") {
      await handleVideoUpload(file);
    } else {
      alert("Only PNG, JPG, JPEG, GIF, and MP4 files are allowed");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1440,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleVideoUpload = async (file: File) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (video.duration > 90) {
        alert("Video length should be under 90 seconds");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreviewVideo(reader.result as string);
      reader.readAsDataURL(file);
    };
    video.src = URL.createObjectURL(file);
  };

  const createPost = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("token", token || "");
      formData.append("caption", caption);

      if (previewImage) {
        const response = await fetch(previewImage);
        const blob = await response.blob();
        formData.append("image", blob, "image.jpg");
      } else if (previewVideo) {
        const response = await fetch(previewVideo);
        const blob = await response.blob();
        formData.append("file", blob, "video.mp4");
      }

      await axios.post(`${BACKEND_URL}/api/post/create`, formData);
      navigate(`/${currentUser}`);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again.");
    }
    setIsLoading(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleRemoveMedia = () => {
    setPreviewVideo(null);
    setPreviewImage(null);
    setCaption("");
  };

  return (
    <div className="flex flex-col h-screen">
      <MenuBar />
      <div className="flex-grow overflow-auto bg-black flex flex-col items-center p-4 pb-20 scrollbar-hide">
        <div className="w-full max-w-md flex flex-col items-center">
          {previewImage || previewVideo ? (
            <>
              <div className="w-full mb-4">
                <textarea
                  className="w-full mb-2 p-2 bg-neutral-900 text-white border border-neutral-800 rounded focus:outline-none focus:border-neutral-700 resize-none scrollbar-hide"
                  rows={2}
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={80}
                />
                <div className="flex justify-end">
                  <button
                    onClick={createPost}
                    disabled={isLoading}
                    className="w-full h-8 flex justify-center items-center bg-white hover:bg-neutral-100 text-black font-normal rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
              <div className="w-full relative">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full" />
                ) : (
                  <div className="relative aspect-square">
                    <video
                      ref={videoRef}
                      src={previewVideo || ""}
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      onClick={togglePlay}
                    />
                    {!isPlaying && (
                      <div
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
                      >
                        <svg
                          className="w-12 h-12 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                            fillRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <label
              htmlFor="file-upload"
              className="w-full h-[calc(100vh-56px-24px-56px)] flex flex-col items-center justify-center cursor-pointer bg-black"
            >
              <svg
                className="w-12 h-12 text-white mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-white">Select photo or video</p>
            </label>
          )}
          <input
            onChange={handleFileUpload}
            id="file-upload"
            type="file"
            accept="image/*, video/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
