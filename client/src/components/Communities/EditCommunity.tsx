import { useState } from "react";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BACKEND_URL } from "../../config";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { CircularProgress } from "@mui/material";
interface CommunityData {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
}
export const EditCommunity: React.FC<{ communityData: CommunityData }> = (
  props
) => {
  const { id, description, category, image } = props.communityData;
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCatagory] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [popup, setPopup] = useState("");
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
  async function updateCommunity() {
    try {
      const file = profileImg;
      let NewDescription = newDescription || description || "description";
      let NewCategory = newCategory || category || "category";
      const formdata = new FormData();
      formdata.append("image", file ? file : "");
      formdata.append("id", id);
      formdata.append("description", NewDescription);
      formdata.append("category", NewCategory);
      formdata.append("token", token ? token : "");

      setIsLoading(true);
      await axios.post(
        `${BACKEND_URL}/api/server/v1/community/update-details`,
        formdata
      );
      setIsLoading(false);
      setProfileImg(null);
      setPreviewImage("");

      window.location.reload();
    } catch (error) {
      console.log("Error updating community:", error);
    }
  }

  return (
    <>
      <div
        style={{ height: "calc(100vh - 56px)" }}
        className=" bg-background/80 text-blakc flex justify-center items-center"
      >
        {isLoading ? (
          <div className="text-center my-5">
            <CircularProgress />
          </div>
        ) : (
          <div className="bg-background w-[85%] border border-neutral-200 p-4 rounded-lg flex flex-col gap-4">
            <div className="w-ful flex justify-between">
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
                    previewImage ? previewImage : image ? image : "/group.png"
                  }
                  className="rounded-full w-20 h-20 lg:w-24 lg:h-24  z-10"
                />
              </div>

              <div className="flex flex-col items-center justify-between">
                <button
                  onClick={() => {
                    history.go(-1);
                  }}
                >
                  <CloseIcon className="text-primarytextcolor" />
                </button>
                <button onClick={updateCommunity}>
                  <div className="text-white bg-neutral-800 text-base font-ubuntu hover:bg-neutral-950 rounded-full py-1 px-4">
                    save
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="text-primarytextcolor">Category</div>
              <select
                defaultValue={category}
                onChange={(e) => {
                  setNewCatagory(e.target.value);
                }}
                className="h-10 w-full rounded-lg px-2 text-secondarytextcolor border border-neutral-200 appearance-none"
              >
                <option value="category" className="text-secondarytextcolor">
                  Select your category
                </option>
                <option value="Outdoor Activities">Outdoor Activities</option>
                <option value="Healthy Living">Healthy Living</option>
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
                <option value="Others">Others</option>
              </select>
            </div>
            <div>
              <div className="text-primarytextcolor">Description</div>
              <textarea
                rows={2}
                defaultValue={description}
                className="w-full px-2 py-1 rounded-lg border border-neutral-200"
                wrap="soft"
                maxLength={150}
                onChange={(e) => {
                  setNewDescription(e.target.value);
                }}
              />
            </div>
            <div className="text-rose-500 font-ubuntu font-light text-center text-sm">
              {popup ? popup : ""}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
