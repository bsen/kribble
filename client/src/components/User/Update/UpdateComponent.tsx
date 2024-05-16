import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { Logout } from "../Auth/Logout";
export const UpdateProfileComponent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  const [bio, setBio] = useState("");
  const [fullname, setFullName] = useState("");
  const [website, setWebsite] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [popup, setPopup] = useState("");
  const [logoutState, setLogoutState] = useState(false);
  const [userData, setUserData] = useState<{
    fullname: string;
    username: string;
    bio: string;
    image: string;
    website: string;
  }>({
    fullname: "",
    username: "",
    bio: "",
    image: "",
    website: "",
  });

  async function getData() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/user/profile/data/editting`,
        {
          token,
        }
      );

      setUserData(response.data.editdata);
      setCurrentUser(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getData();
  }, []);

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
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 0, 0);
          const compressedImageData = canvas.toDataURL("image/jpeg", 0.8);
          setPreviewImage(compressedImageData);
        }
      };
    };

    reader.readAsDataURL(file);
  };
  async function updateProfile() {
    try {
      let imageToUpload = null;

      if (previewImage) {
        if (typeof previewImage === "string") {
          const fileName = "profileImage.jpeg";
          const fileType = "image/jpeg";
          const binaryString = window.atob(previewImage.split(",")[1]);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const arrayBuffer = bytes.buffer;
          const blob = new Blob([arrayBuffer], { type: fileType });
          imageToUpload = new File([blob], fileName, { type: fileType });
        } else {
          imageToUpload = previewImage;
        }
      }

      let newFullName = fullname || userData.fullname || "";
      let newBio = bio || userData.bio || "bio";
      let newWebsite = website || userData.website || "website";

      const formdata = new FormData();
      if (imageToUpload) {
        formdata.append("image", imageToUpload);
      }
      formdata.append("fullname", newFullName);
      formdata.append("bio", newBio);
      formdata.append("website", newWebsite);
      formdata.append("token", token ? token : "");

      setIsLoading(true);
      await axios.post(`${BACKEND_URL}/api/user/profile/update`, formdata);
      setIsLoading(false);
      navigate(`/${currentUser}`);
    } catch (error) {
      console.log("Error updating profile:", error);
    }
  }
  if (isLoading) {
    return (
      <div className="h-screen bg-bgmain w-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }
  return (
    <>
      <div className="h-screen text-texttwo">
        <div className="w-full">{logoutState && <Logout />}</div>
        <div className="w-full">
          {!logoutState && (
            <div className="bg-bgmain h-screen  p-2 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-bordermain pb-2">
                <button
                  onClick={() => {
                    navigate(`/${currentUser}`);
                  }}
                >
                  <ArrowBackIcon
                    sx={{ fontSize: 30 }}
                    className="text-textmain"
                  />
                </button>
                <button
                  onClick={() => {
                    setLogoutState(true);
                  }}
                >
                  <div className="text-rosemain text-sm font-normal px-2 py-1 bg-bgtwo rounded-md">
                    Log out
                  </div>
                </button>
              </div>
              <div className="w-full flex justify-between items-end">
                <div className="flex justify-center items-center">
                  <div className="absolute text-textmain z-50">
                    <button>
                      <label htmlFor="image-upload" className="cursor-pointer ">
                        <CameraAltRoundedIcon className="bg-bgmain/50 p-1 rounded-full" />
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </button>
                  </div>
                  <img
                    src={
                      previewImage
                        ? previewImage
                        : userData.image
                        ? userData.image
                        : "/user.png"
                    }
                    className="rounded-full w-20 h-20 lg:w-24 lg:h-24  z-10"
                  />
                </div>

                <button onClick={updateProfile}>
                  <div className="text-textmain bg-indigomain text-base font-light rounded-md py-1 px-4">
                    save
                  </div>
                </button>
              </div>

              <div>
                <div className="text-textmain text-sm font-light">Name</div>
                <input
                  maxLength={20}
                  defaultValue={userData.fullname}
                  onChange={(e) => {
                    setFullName(e.target.value);
                  }}
                  className=" h-10 w-full bg-bgtwo text-textmain text-base font-light rounded-lg px-2 focus:outline-none border border-bordermain"
                />
              </div>
              <div>
                <div className="text-textmain text-sm font-light">Website</div>
                <input
                  type="link"
                  maxLength={40}
                  defaultValue={userData.website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                  }}
                  className=" h-10 bg-bgtwo text-textmain w-full text-base font-light rounded-lg px-2 focus:outline-none border border-bordermain"
                />
              </div>
              <div>
                <div className="text-textmain text-sm  font-light">Bio</div>
                <textarea
                  rows={2}
                  className="w-full bg-bgtwo text-textmain text-base font-light px-2 py-1 resize-none no-scrollbar rounded-lg border border-bordermain"
                  defaultValue={userData.bio}
                  wrap="soft"
                  maxLength={150}
                  onChange={(e) => {
                    setBio(e.target.value);
                  }}
                />
              </div>
              <div className="text-rosemain font-ubuntu font-light text-center text-sm">
                {popup ? popup : <div>‎</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
