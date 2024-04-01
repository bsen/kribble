import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingPage } from "../LoadingPage";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BACKEND_URL } from "../../config";
import axios from "axios";
export const EditProfile = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(true);
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");

  const [relationstatus, setRelationStatus] = useState("");
  const [userData, setUserData] = useState<{
    name: string;
    bio: string;
    image: string;
    website: string;
    relationstatus: string;
  }>({
    name: "",
    bio: "",
    image: "",
    website: "",
    relationstatus: "",
  });
  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token }
      );
      const userDataFromServer = response.data.message;
      setUserData({
        name: userDataFromServer.name || "",
        bio: userDataFromServer.bio || "",
        image: userDataFromServer.image || "",
        website: userDataFromServer.website || "",
        relationstatus: userDataFromServer.relationstatus || "",
      });
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

    const maxFileSize = 10 * 1024 * 1024;
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
  async function updateProfile() {
    try {
      if (
        name.length == 0 ||
        bio.length == 0 ||
        relationstatus.length == 0 ||
        website.length == 0
      ) {
      }
      const file = profileImg;
      const newName = name !== "" ? name : userData.name;
      const newBio = bio !== "" ? bio : userData.bio;
      const newWebsite = website !== "" ? website : userData.website;
      const newRelationStatus =
        relationstatus !== "" ? relationstatus : userData.relationstatus;

      const formdata = new FormData();
      formdata.append("image", file ? file : "");
      formdata.append("name", newName);
      formdata.append("bio", newBio);
      formdata.append("website", newWebsite);
      formdata.append("relationstatus", newRelationStatus);
      formdata.append("token", token ? token : "");

      setLoadingState(true);
      await axios.post(
        `${BACKEND_URL}/api/server/v1/user/profile/update`,
        formdata
      );
      setLoadingState(false);
      setProfileImg(null);
      setPreviewImage("");
      setBio("");
      setName("");
      setWebsite("");
      setRelationStatus("");
      window.location.reload();
    } catch (error) {
      console.log("Error updating profile:", error);
    }
  }

  return (
    <>
      <div className="h-screen bg-black/50 text-blakc flex justify-center items-center">
        {loadingState ? (
          <LoadingPage />
        ) : (
          <div className="bg-black w-[80%]  border border-bordercolor p-4 rounded-lg flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-bordercolor pb-4">
              <button
                onClick={() => {
                  window.location.reload();
                }}
              >
                <CloseIcon className="text-white" />
              </button>
              <button onClick={updateProfile}>
                <div className="text-white text-sm font-ubuntu border border-neutral-500 hover:bg-neutral-800 rounded-full py-1 px-4">
                  save
                </div>
              </button>
            </div>
            <div className="h-24 w-24 rounded-full  flex justify-center items-center">
              <div className="absolute text-white z-50">
                <button>
                  <label htmlFor="image-upload" className="cursor-pointer ">
                    <CameraAltRoundedIcon />
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
                className="rounded-full z-10"
              />
            </div>

            <div>
              <div className="text-neutral-100">Name</div>
              <input
                maxLength={20}
                defaultValue={userData.name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                className=" h-10 w-full rounded-lg px-2 focus:outline-none border border-neutral-300"
              />
            </div>
            <div>
              <div className="text-neutral-100">Website</div>
              <input
                type="link"
                placeholder="your website"
                onChange={(e) => {
                  setWebsite(e.target.value);
                }}
                className=" h-10 w-full rounded-lg px-2 focus:outline-none border border-neutral-300"
              />
            </div>
            <div>
              <div className="text-neutral-100">Relationship status</div>{" "}
              <select
                className="h-10 w-full rounded-lg px-2 text-neutral-600 bg-white border border-neutral-300 appearance-none"
                onChange={(e) => setRelationStatus(e.target.value)}
              >
                <option value="" className="text-neutral-400">
                  relationship status
                </option>
                <option value="single">single</option>
                <option value="in a relationship">in a relationship</option>
                <option value="engaged">engaged</option>
                <option value="married">married</option>
                <option value="i'm good">i'm good</option>
              </select>
            </div>
            <div>
              <div className="text-neutral-100">Bio</div>
              <textarea
                rows={4}
                className="w-full p-2  rounded-lg"
                defaultValue={userData.bio}
                wrap="soft"
                maxLength={200}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
