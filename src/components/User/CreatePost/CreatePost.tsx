import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
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
    <>
      <MenuBar />
      <Box sx={{ backgroundColor: "black", minHeight: "100vh" }}>
        <MenuBar />
        <Box
          sx={{
            flexGrow: 1,
            minHeight: "calc(100vh - 56px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 1.5,
          }}
        >
          {previewImage || previewVideo ? (
            <Box sx={{ width: "100%", maxWidth: 400, position: "relative" }}>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{ width: "100%" }}
                />
              ) : (
                <Box sx={{ position: "relative", aspectRatio: "1 / 1" }}>
                  <video
                    ref={videoRef}
                    src={previewVideo || ""}
                    loop
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onClick={togglePlay}
                  />
                  {!isPlaying && (
                    <Box
                      onClick={togglePlay}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        cursor: "pointer",
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 48, color: "white" }} />
                    </Box>
                  )}
                </Box>
              )}
              <IconButton
                onClick={handleRemoveMedia}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                }}
              >
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>
          ) : (
            <label
              htmlFor="file-upload"
              style={{ width: "100%", height: "100%" }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "calc(100vh - 56px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backgroundColor: "black",
                }}
              >
                <ImageIcon sx={{ fontSize: 48, color: "#8e8e8e", mb: 1 }} />
                <Typography sx={{ color: "#8e8e8e" }}>
                  Select photo or video
                </Typography>
              </Box>
            </label>
          )}
          <input
            onChange={handleFileUpload}
            id="file-upload"
            type="file"
            accept="image/*, video/*"
            style={{ display: "none" }}
          />
          {(previewImage || previewVideo) && (
            <Box sx={{ paddingTop: 1.5, width: "100%", maxWidth: 400 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                inputProps={{
                  maxLength: 500,
                }}
                InputProps={{
                  style: {
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                  },
                }}
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "#262626",
                    },
                    "&:hover fieldset": {
                      borderColor: "#262626",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#262626",
                    },
                    "& textarea": {
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                      "&-ms-overflow-style": {
                        display: "none",
                      },
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "white",
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={createPost}
                  disabled={isLoading}
                  className="text-base h-8 w-16 flex justify-center items-center bg-white hover:bg-neutral-100 text-black font-normal rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                >
                  {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Post"
                  )}
                </button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
