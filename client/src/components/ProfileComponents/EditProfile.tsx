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
      if (
        name.length == 0 ||
        bio.length == 0 ||
        interest.length == 0 ||
        website.length == 0
      ) {
      }
      const file = profileImg;
      const newName = name !== "" ? name : userData.name;
      const newBio = bio !== "" ? bio : userData.bio;
      const newWebsite = website !== "" ? website : userData.website;
      const newInterest = interest !== "" ? interest : userData.interest;

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
                        <CameraAltRoundedIcon className="bg-white rounded-full" />
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
                  <option value="Paranormal Investigations">
                    Paranormal Investigations
                  </option>
                  <option value="Urban Exploration">Urban Exploration</option>
                  <option value="Extreme Ironing">Extreme Ironing</option>
                  <option value="Competitive Eating">Competitive Eating</option>
                  <option value="Puppetry & Marionettes">
                    Puppetry & Marionettes
                  </option>
                  <option value="Cryptozoology">Cryptozoology</option>
                  <option value="Vintage Tea Party Planning">
                    Vintage Tea Party Planning
                  </option>
                  <option value="Unicycling & Juggling">
                    Unicycling & Juggling
                  </option>
                  <option value="Competitive Beard Grooming">
                    Competitive Beard Grooming
                  </option>
                  <option value="Cloud Watching">Cloud Watching</option>
                  <option value="Retro Gaming Collecting">
                    Retro Gaming Collecting
                  </option>
                  <option value="Tea Leaf Reading">Tea Leaf Reading</option>
                  <option value="Dumpster Diving">Dumpster Diving</option>
                  <option value="Conlanging (Constructed Languages)">
                    Conlanging (Constructed Languages)
                  </option>
                  <option value="Synchronized Swimming for Dogs">
                    Synchronized Swimming for Dogs
                  </option>
                  <option value="Science & Technology">
                    Science & Technology
                  </option>
                  <option value="Coding & Programming">
                    Coding & Programming
                  </option>
                  <option value="Movies & Filmmaking">
                    Movies & Filmmaking
                  </option>
                  <option value="Travel & Adventure">Travel & Adventure</option>
                  <option value="Photography & Videography">
                    Photography & Videography
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
