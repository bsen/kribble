import { useEffect, useState } from "react";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import axios from "axios";
import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
interface CommunityData {
  id: string;
  name: string;
  image: string;
  description: string;
}
export const UpdateCommunityComponent = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [popup, setPopup] = useState("");
  const [communityData, setCommunityData] = useState<CommunityData>({
    id: "",
    name: "",
    image: "",
    description: "",
  });
  const getCommunityData = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/community/profile/edit/data`,
        { token, name }
      );
      setCommunityData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCommunityData();
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
          const roundImage = canvas.toDataURL();
          setPreviewImage(roundImage);
        }
      };
    };
    reader.readAsDataURL(file);
  };
  async function updateCommunity() {
    try {
      let imageToUpload;

      if (typeof previewImage === "string") {
        try {
          const fileName = "communityImage.jpeg";
          const fileType = "image/jpeg";

          const binaryString = atob(previewImage.split(",")[1]);
          const arrayBuffer = new ArrayBuffer(binaryString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], { type: fileType });

          imageToUpload = new File([blob], fileName, { type: fileType });
        } catch (error) {
          console.error("Error converting Base64 to File:", error);
        }
      } else {
        imageToUpload = previewImage;
      }

      let NewDescription =
        newDescription || communityData.description || "description";

      const formdata = new FormData();
      if (imageToUpload) {
        formdata.append("image", imageToUpload);
      }
      formdata.append("id", communityData.id);
      formdata.append("description", NewDescription);
      formdata.append("token", token ? token : "");

      setIsLoading(true);
      await axios.post(`${BACKEND_URL}/api/community/profile/update`, formdata);
      setIsLoading(false);
      navigate(`/community/${communityData.name}`);
    } catch (error) {
      console.log("Error updating community:", error);
    }
  }
  if (isLoading) {
    return (
      <div className="h-screen bg-white w-full flex justify-center items-center">
        <CircularProgress color="inherit" />
      </div>
    );
  }
  return (
    <>
      <div className="bg-white h-screen border-l border-r border-neutral-100 px-4 flex flex-col gap-4">
        <div className=" border-b border-neutral-100 py-4">
          <button
            className="w-fit flex items-start"
            onClick={() => {
              navigate(`/community/${communityData.name}`);
            }}
          >
            <ArrowBackIcon
              sx={{ fontSize: 30 }}
              className="text-primarytextcolor"
            />
          </button>
        </div>
        <div className="w-ful items-start flex justify-between">
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
                  : communityData.image
                  ? communityData.image
                  : "/group.png"
              }
              className="rounded-full w-20 h-20 lg:w-24 lg:h-24  z-10 border border-neutral-50"
            />
          </div>

          <button onClick={updateCommunity}>
            <div className="text-white bg-indigo-500 text-base font-light rounded-md py-1 px-4">
              save
            </div>
          </button>
        </div>
        <div>
          <div className="text-primarytextcolor  text-sm font-light">
            Description
          </div>
          <textarea
            rows={2}
            className="w-full px-2 py-1 text-base font-light resize-none no-scrollbar rounded-lg border border-neutral-100"
            defaultValue={communityData.description}
            wrap="soft"
            maxLength={150}
            onChange={(e) => {
              setNewDescription(e.target.value);
            }}
          />
        </div>
        <div className="text-rose-500 font-ubuntu font-light text-center text-sm">
          {popup ? popup : <div>‎</div>}
        </div>
      </div>
    </>
  );
};
