import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Logout } from "../Auth/Logout";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BACKEND_URL } from "../../config";
import { LoadingPage } from "../LoadingPage";
import axios from "axios";
import { useParams } from "react-router-dom";
export const EditProfile = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(true);
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [logOutState, setLogOutState] = useState(false);
  const [relationstatus, setRelationStatus] = useState("");
  const [popup, setPopup] = useState("");
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
  const { username } = useParams();

  async function getData() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token, username }
      );
      setUserData(response.data.message);
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
      setPopup("File size exceeds 10MB limit");
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
      {logOutState ? (
        <Logout />
      ) : (
        <div className="h-screen bg-black/50 text-blakc flex justify-center items-center">
          {loadingState ? (
            <LoadingPage />
          ) : (
            <div className="bg-black w-[90%]   border border-neutral-800 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  <CloseIcon className="text-white" />
                </button>
                <button
                  onClick={() => {
                    setLogOutState(true);
                  }}
                >
                  <div className="text-white text-sm font-semibold font-ubuntu px-2 underline underline-offset-2">
                    Log out
                  </div>
                </button>
              </div>
              <div className="w-full flex justify-between items-end">
                <div className="flex justify-center items-center">
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
                    className="rounded-full w-20 h-20 lg:w-24 lg:h-24  z-10"
                  />
                </div>

                <button onClick={updateProfile}>
                  <div className="text-white text-sm font-ubuntu border border-neutral-500 hover:bg-neutral-800 rounded-full py-1 px-4">
                    save
                  </div>
                </button>
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
                  defaultValue={userData.website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                  }}
                  className=" h-10 w-full rounded-lg px-2 focus:outline-none border border-neutral-300"
                />
              </div>
              <div>
                <div className="text-neutral-100">Relationship status</div>{" "}
                <select
                  className="h-10 w-full rounded-lg px-2 text-neutral-600 bg-black border border-neutral-300 appearance-none"
                  onChange={(e) => setRelationStatus(e.target.value)}
                >
                  <option value="" className="text-neutral-400">
                    relationship status
                  </option>
                  <option value="secret">secret</option>
                  <option value="single">single</option>
                  <option value="committed">committed</option>
                  <option value="married">married</option>
                </select>
              </div>
              <div>
                <div className="text-neutral-100">Bio</div>
                <textarea
                  rows={4}
                  className="w-full p-2  rounded-lg"
                  defaultValue={userData.bio}
                  wrap="soft"
                  maxLength={160}
                  onChange={(e) => {
                    setBio(e.target.value);
                  }}
                />
              </div>
              <div className="text-rose-500 font-ubuntu font-light text-center text-sm">
                {popup ? popup : ""}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
