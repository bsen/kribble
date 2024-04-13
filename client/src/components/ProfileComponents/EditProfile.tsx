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
  const [interest, setInterest] = useState("");
  const [popup, setPopup] = useState("");
  const [userData, setUserData] = useState<{
    name: string;
    bio: string;
    image: string;
    website: string;
    interest: string;
  }>({
    name: "",
    bio: "",
    image: "",
    website: "",
    interest: "",
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
      const file = profileImg;
      const newName = name !== "" ? name : userData.name;
      const newBio = bio !== "" ? bio : userData.bio;
      const newWebsite = website !== "" ? website : userData.website;
      const newInterest = interest !== "" ? interest : userData.interest;
      console.log(typeof bio);

      console.log(typeof newBio);
      const formdata = new FormData();
      formdata.append("image", file ? file : "");
      formdata.append("name", newName);
      formdata.append("bio", newBio);
      formdata.append("website", newWebsite);
      formdata.append("interest", newInterest);
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
      setInterest("");
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
        <div className="h-screen bg-background/80 text-blakc flex justify-center items-center">
          {loadingState ? (
            <LoadingPage />
          ) : (
            <div className="bg-background w-[85%]   border border-neutral-200 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  <CloseIcon className="text-primarytextcolor" />
                </button>
                <button
                  onClick={() => {
                    setLogOutState(true);
                  }}
                >
                  <div className="text-primarytextcolor text-sm font-semibold font-ubuntu px-2 underline underline-offset-2">
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
                  <div className="text-primarytextcolor text-sm font-ubuntu border border-secondarytextcolor hover:bg-neutral-50 rounded-full py-1 px-4">
                    save
                  </div>
                </button>
              </div>

              <div>
                <div className="text-primarytextcolor">Name</div>
                <input
                  maxLength={20}
                  defaultValue={userData.name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className=" h-10 w-full rounded-lg px-2 focus:outline-none border border-neutral-200"
                />
              </div>
              <div>
                <div className="text-primarytextcolor">Website</div>
                <input
                  type="link"
                  defaultValue={userData.website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                  }}
                  className=" h-10 w-full rounded-lg px-2 focus:outline-none border border-neutral-200"
                />
              </div>
              <div>
                <div className="text-primarytextcolor">Interest</div>{" "}
                <select
                  className="h-10 w-full rounded-lg px-2 text-secondarytextcolor border border-neutral-200 appearance-none"
                  onChange={(e) => setInterest(e.target.value)}
                  defaultValue={userData.interest}
                >
                  <option value="" className="text-secondarytextcolor">
                    Select your interests
                  </option>
                  <option value="Outdoor Activities">Outdoor Activities</option>
                  <option value="Healthy Living">Healthy Living</option>
                  <option value="Exploring New Cultures">
                    Exploring New Cultures
                  </option>
                  <option value="Cooking & Gastronomy">
                    Cooking & Gastronomy
                  </option>
                  <option value="Art & Creativity">Art & Creativity</option>
                  <option value="Music & Dance">Music & Dance</option>
                  <option value="Technology & Innovation">
                    Technology & Innovation
                  </option>
                  <option value="Coding & Development">
                    Coding & Development
                  </option>
                  <option value="Film & Cinema">Film & Cinema</option>
                  <option value="Literature & Writing">
                    Literature & Writing
                  </option>
                  <option value="Travel & Adventure">Travel & Adventure</option>
                  <option value="Environmental Conservation">
                    Environmental Conservation
                  </option>
                  <option value="Mindfulness & Wellness">
                    Mindfulness & Wellness
                  </option>
                  <option value="History & Archaeology">
                    History & Archaeology
                  </option>
                  <option value="Fashion & Design">Fashion & Design</option>
                  <option value="Gaming & eSports">Gaming & eSports</option>
                  <option value="Photography & Visual Arts">
                    Photography & Visual Arts
                  </option>
                  <option value="Science & Exploration">
                    Science & Exploration
                  </option>
                </select>
              </div>
              <div>
                <div className="text-primarytextcolor">Bio</div>
                <textarea
                  rows={4}
                  className="w-full p-2  rounded-lg border border-neutral-200"
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
