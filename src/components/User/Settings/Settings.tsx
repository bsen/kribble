import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import { MenuBar } from "../../Menu/MenuBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import CircularProgress from "@mui/material/CircularProgress";

interface UserData {
  username: string;
  bio: string;
  image: string;
  link: string;
}

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userData: UserData = (location.state?.userData as UserData) || {
    username: "",
    bio: "",
    image: "",
    link: "",
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bio, setBio] = useState<string>(userData.bio);
  const [link, setLink] = useState<string>(userData.link);
  const [previewImage, setPreviewImage] = useState<string>(userData.image);
  const [popup, setPopup] = useState<string>("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setPopup("File size is more than 10 MB");
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

  const updateProfile = async () => {
    try {
      let imageToUpload: File | null = null;
      if (previewImage && previewImage !== userData.image) {
        const response = await fetch(previewImage);
        const blob = await response.blob();
        imageToUpload = new File([blob], "profile.jpeg", {
          type: "image/jpeg",
        });
      }

      const formdata = new FormData();
      if (imageToUpload) formdata.append("image", imageToUpload);
      formdata.append("bio", bio);
      formdata.append("link", link);
      formdata.append("token", token || "");

      setIsLoading(true);
      await axios.post(`${BACKEND_URL}/api/user/profile/update`, formdata);
      setIsLoading(false);
      navigate(`/${userData.username}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      setPopup("Failed to update profile. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <MenuBar />
      <div className="flex justify-center min-h-screen text-white">
        <div className="w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <Link
              to={`/${userData.username}`}
              className="text-gray-400 hover:text-white"
            >
              <ArrowBackIcon />
            </Link>
            <h1 className="text-xl font-light">Edit Profile</h1>
            <button
              onClick={updateProfile}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>

          <div className="mb-6 relative">
            <img
              src={previewImage || "/user.png"}
              alt={userData.username}
              className="w-24 h-24 rounded-full mx-auto"
            />
            <label
              htmlFor="image-upload"
              className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-gray-800 p-2 rounded-full cursor-pointer"
            >
              <CameraAltRoundedIcon />
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="mb-4">
            <label htmlFor="website" className="block text-sm font-medium mb-2">
              Website
            </label>
            <input
              type="text"
              id="website"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-dark text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-dark text-white p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              maxLength={150}
              placeholder="Tell us about yourself..."
            />
          </div>

          {popup && (
            <div className="text-rosemain text-center mb-4">{popup}</div>
          )}

          {isLoading && (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          )}

          <div className="text-center text-sm text-gray-400 mt-6">
            Need assistance or have suggestions? Contact us at{" "}
            <a
              href="mailto:info@algabay.com"
              className="text-blue-400 hover:underline"
            >
              info@algabay.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
