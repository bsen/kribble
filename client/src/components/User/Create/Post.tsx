import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import { UserContext } from "../Context/UserContext";
import {
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Send,
} from "lucide-react";

interface PostCreatorProps {
  isCommunityPost: boolean;
  communityName?: string;
}

export const CreatePostComponent: React.FC<PostCreatorProps> = ({
  isCommunityPost,
  communityName,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [anonymity, setAnonymity] = useState(false);
  const [error, setError] = useState("");
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;

    const maxFileSize = 15 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setError("File size should be under 15 MB");
      return;
    }

    const allowedTypes = {
      image: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
      video: ["video/mp4"],
    };

    if (allowedTypes.image.includes(file.type)) {
      await handleImageUpload(file);
    } else if (allowedTypes.video.includes(file.type)) {
      await handleVideoUpload(file);
    } else {
      setError("Only PNG, JPG, JPEG, GIF, and MP4 files are allowed");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      setError("Error processing image");
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 90) {
          setError("Video length should be under 90 seconds");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewVideo(reader.result as string);
        };
        reader.readAsDataURL(file);
      };

      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Error handling video upload:", error);
      setError("Error uploading video");
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const createPost = async () => {
    setError("");
    if (!previewImage && !previewVideo && !caption) {
      setError("Please add an image, video, or caption");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("token", token || "");
      formData.append("anonymity", String(anonymity));

      if (isCommunityPost && communityName) {
        formData.append("communityName", communityName);
      }

      if (previewImage) {
        const response = await fetch(previewImage);
        const blob = await response.blob();
        formData.append("image", blob, "image.jpg");
      } else if (previewVideo) {
        const response = await fetch(previewVideo);
        const blob = await response.blob();
        formData.append("file", blob, "video.mp4");
      }

      await axios.post(`${BACKEND_URL}/api/post/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (isCommunityPost) {
        navigate(`/community/${communityName}`);
      } else {
        navigate(`/${currentUser}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-black rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-100">
              {isCommunityPost ? `Post to c/${communityName}` : "Create Post"}
            </h2>
            <button
              onClick={() => setAnonymity(!anonymity)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              {anonymity ? (
                <EyeOff className="w-4 h-4 text-indigo-400" />
              ) : (
                <Eye className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-sm text-neutral-300">
                {anonymity ? "Anonymous" : "Public"}
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {/* Media Preview */}
          {previewImage || previewVideo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setPreviewVideo(null);
                    setPreviewImage(null);
                  }}
                  className="flex items-center gap-2 text-neutral-400 hover:text-neutral-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Remove media</span>
                </button>
              </div>

              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : previewVideo ? (
                <div className="relative w-full h-96 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={previewVideo}
                    loop
                    playsInline
                    onClick={togglePlay}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Send className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <label className="block w-full h-48 border-2 border-dashed border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-600 transition-colors">
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <ImageIcon className="w-10 h-10 text-neutral-500" />
                <span className="text-neutral-400">Click to upload media</span>
                <span className="text-xs text-neutral-500">
                  PNG, JPG, GIF, MP4 (max 15MB)
                </span>
              </div>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*, video/*"
                className="hidden"
              />
            </label>
          )}

          {/* Caption Input */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your thoughts..."
            className="mt-4 w-full h-32 bg-neutral-800 rounded-lg p-3 text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={250}
          />

          {/* Submit Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={createPost}
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostComponent;
