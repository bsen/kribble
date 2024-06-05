import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";
import { Logout } from "../Auth/Logout";
import { NavBar } from "../../Bars/NavBar";

export const UpdateProfileComponent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [popup, setPopup] = useState("");
  const [logoutState, setLogoutState] = useState(false);
  const [userData, setUserData] = useState<{
    username: string;
    bio: string;
    image: string;
    website: string;
  }>({
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

      let newBio = bio || userData.bio || "";
      let newWebsite = website || userData.website || "";

      const formdata = new FormData();
      if (imageToUpload) {
        formdata.append("image", imageToUpload);
      }

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
    return <LinearProgress sx={{ backgroundColor: "black" }} />;
  }
  return (
    <>
      <div className="h-screen text-semilight">
        <div className="w-full">{logoutState && <Logout />}</div>
        <div className="w-full">
          {!logoutState && (
            <div className="py-12">
              <NavBar />
              <div className="bg-dark h-fit mt-3 p-3 flex flex-col gap-4 rounded-lg">
                <div className="flex justify-between items-center border-b border-semidark pb-2">
                  <button
                    onClick={() => {
                      navigate(`/${currentUser}`);
                    }}
                  >
                    <ArrowBackIcon
                      sx={{ fontSize: 30 }}
                      className="text-light"
                    />
                  </button>
                  <button
                    onClick={() => {
                      setLogoutState(true);
                    }}
                  >
                    <div className="text-rosemain text-sm font-normal px-2 py-1 bg-semidark rounded-lg">
                      Log out
                    </div>
                  </button>
                </div>
                <div className="w-full flex justify-between items-end">
                  <div className="flex justify-center items-center">
                    <div className="absolute text-light z-50">
                      <button>
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer "
                        >
                          <CameraAltRoundedIcon className="bg-dark/50 p-1 rounded-lg" />
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
                      className="rounded-lg w-20 h-20 lg:w-24 lg:h-24  z-10"
                    />
                  </div>

                  <button onClick={updateProfile}>
                    <div className="text-semilight bg-indigomain text-base font-light rounded-lg py-1 px-4">
                      save
                    </div>
                  </button>
                </div>
                <div>
                  <div className="text-semilight text-sm font-light">
                    Website
                  </div>
                  <input
                    type="link"
                    maxLength={40}
                    defaultValue={userData.website}
                    onChange={(e) => {
                      setWebsite(e.target.value);
                    }}
                    className=" h-10 bg-semidark text-semilight w-full text-base font-light rounded-lg px-2 focus:outline-none border border-semidark"
                  />
                </div>

                <div>
                  <div className="text-semilight text-sm font-light">Bio</div>
                  <textarea
                    rows={2}
                    className="w-full bg-semidark text-semilight text-base font-light px-2 py-1 resize-none no-scrollbar rounded-lg border border-semidark"
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};
