import React, { useEffect, useState } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import { BACKEND_URL } from "../config";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { ButtonsSidebar } from "./ButtonsSidebar";
import { UserProfilePosts } from "./UserComponents/UserProfilePosts";
import { LoadinPage } from "./LoadinPage";
export const Profilepage: React.FC = () => {
  const [loadingState, setLoadingState] = useState(false);

  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    username: string;
    gender: string;
    bio: string;
    image: string;
    followers: {
      followerId: string;
      followingId: string;
    }[];
    following: {
      followerId: string;
      followingId: string;
    }[];
  }>({
    id: "",
    name: "",
    username: "",
    gender: "",
    bio: "",
    image: "",
    followers: [],
    following: [],
  });

  const [bio, setBio] = useState("");
  const [imageUpdateState, setImageUpdateState] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [postDeletionState, setPostDeletionState] = useState(false);
  const [deletingPost, setDeletingPost] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [isBioEditing, setIsBioEditing] = useState(false);
  const token = localStorage.getItem("token");

  async function getData() {
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token }
      );
      setUserData(response.data.message);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function bioUpdate() {
    if (bio.length == 0) {
      alert("enter a valid bio");
      return;
    }
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/bioupdate`,
        { token, bio }
      );

      if (response.data.status == 200) {
        setIsBioEditing(false);
        getData();
        alert("Bio updated successfully");
      }
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxFileSize) {
      alert("File size exceeds 10MB limit");
      return;
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, and JPEG files are allowed");
      return;
    }

    setProfileImg(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const savePhoto = async () => {
    const file = profileImg;
    const formdata = new FormData();
    formdata.append("image", file ? file : "");
    formdata.append("token", token ? token : "");
    setLoadingState(true);
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/profile-picture-update`,
      formdata
    );
    setLoadingState(false);

    if (response.data.status === 200) {
      setPreviewImage("");
      setProfileImg(null);
      getData();
      return alert("Image updated");
    } else {
      return alert("Server error, try again later");
    }
  };
  const cancelSave = () => {
    setProfileImg(null);
    setPreviewImage("");
  };

  async function deletePost() {
    const postId = deletingPost;
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/delete-post`,
        { token, postId }
      );
      setLoadingState(false);
      setPostDeletionState(false);
      setDeletingPost("");
      if (response.data.status == 200) {
        alert("post deleted succesfull");
        getData();
      } else {
        alert("post deletion failed, try again later");
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function removeDp() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/remove-dp`,
        {
          token,
        }
      );
      setImageUpdateState(false);
      setLoadingState(false);
      if (response.data.status == 200) {
        alert("profile photo deleted successfuly");
        getData();
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    try {
      getData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);
  useEffect(() => {}, [userData.bio]);

  return (
    <div className="h-screen border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
      <div className="p-5 border-b border-bordercolor">
        <div className="flex gap-4">
          <div>
            <img
              src={userData.image ? userData.image : "/user.png"}
              alt="Profile"
              className="w-16 h-16 lg:w-24 lg:h-24 rounded-full"
            />
          </div>
        </div>
        <div className="my-2">
          <div className="text-xl font-semibold text-white">
            {userData.name}
          </div>
          <div className="text-sm text-neutral-400 font-light">
            @{userData.username}
          </div>
          <div className="text-white my-2 text-base font-light">
            {userData.bio ? <div>{userData.bio}</div> : <div>empty bio</div>}
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <div className="text-white">{userData.followers.length}</div>
              <div className="text-neutral-400">Followers</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-white">{userData.following.length}</div>
              <div className="text-neutral-400">Following</div>
            </div>
          </div>
        </div>
      </div>

      <UserProfilePosts />
    </div>
  );
};
