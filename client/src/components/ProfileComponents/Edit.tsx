import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BACKEND_URL } from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
export const Edit = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [popup, setPopup] = useState("");
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    bio: string;
    image: string;
    website: string;
  }>({
    name: "",
    username: "",
    bio: "",
    image: "",
    website: "",
  });

  async function getData() {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/auth/verify`, {
        token,
      });

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

    setProfileImg(file);

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
          const roundImage = canvas.toDataURL();
          setPreviewImage(roundImage);
        }
      };
    };
    reader.readAsDataURL(file);
  };
  async function updateProfile() {
    try {
      const file = profileImg;
      let newName = name || userData.name || "";
      let newBio = bio || userData.bio || "bio";
      let newWebsite = website || userData.website || "https://www.kribble.net";

      const formdata = new FormData();
      formdata.append("image", file ? file : "");
      formdata.append("name", newName);
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

  return (
    <>
      <div className="h-screen text-neutral-600 flex justify-center items-center">
        {isLoading ? (
          <div className="text-center my-5">
            <CircularProgress color="inherit" />
          </div>
        ) : (
          <div className="bg-white w-[85%]   border border-neutral-100 p-4 rounded-lg flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <button
                onClick={() => {
                  navigate(`/${currentUser}`);
                }}
              >
                <ArrowBackIcon className="text-primarytextcolor" />
              </button>
              <button onClick={() => {}}>
                <div className="text-rose-500 text-sm font-normal px-2 py-1 bg-rose-100 rounded-md">
                  Log out
                </div>
              </button>
            </div>
            <div className="w-full flex justify-between items-end">
              <div className="flex justify-center items-center">
                <div className="absolute text-primarytextcolor z-50">
                  <button>
                    <label htmlFor="image-upload" className="cursor-pointer ">
                      <CameraAltRoundedIcon className="bg-white/50 p-1 rounded-full" />
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
                <div className="text-white bg-indigo-600 text-base font-light rounded-md py-1 px-4">
                  save
                </div>
              </button>
            </div>

            <div>
              <div className="text-primarytextcolor text-base font-light">
                Name
              </div>
              <input
                maxLength={20}
                defaultValue={userData.name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                className=" h-10 w-full text-base font-light rounded-lg px-2 focus:outline-none border border-neutral-100"
              />
            </div>
            <div>
              <div className="text-primarytextcolor text-base font-light">
                Website
              </div>
              <input
                type="link"
                maxLength={40}
                defaultValue={userData.website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                }}
                className=" h-10 w-full text-base font-light rounded-lg px-2 focus:outline-none border border-neutral-100"
              />
            </div>
            <div>
              <div className="text-primarytextcolor text-base font-light">
                Bio
              </div>
              <textarea
                rows={2}
                className="w-full text-base font-light px-2 py-1 resize-none no-scrollbar rounded-lg border border-neutral-100"
                defaultValue={userData.bio}
                wrap="soft"
                maxLength={150}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
              />
            </div>
            <div className="text-rose-500 font-ubuntu font-light text-center text-sm">
              {popup ? popup : <div>‎</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
