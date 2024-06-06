import { useEffect, useState } from "react";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { LinearProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";

export const UpdateCommunityComponent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [popup, setPopup] = useState("");
  const [CommunityDeletingState, setCommunityDeletingState] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const location = useLocation();

  const communityData = location.state?.communityData || {
    id: "",
    name: "",
    image: "",
    description: "",
  };

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
  async function updateCommunity() {
    try {
      let imageToUpload;

      if (typeof previewImage === "string") {
        try {
          const fileName = "profile.jpeg";
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
      formdata.append("communityId", communityData.id);
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

  useEffect(() => {
    setPopup("");
  }, [confirmation]);
  const deleteCommunity = async () => {
    if (confirmation !== "Delete community") {
      return setPopup(
        "Please confirm the deletion by typing the given senetence"
      );
    }
    setIsLoading(true);
    const response = await axios.post(
      `${BACKEND_URL}/api/community/delete/delete/community`,
      { token, communityId: communityData.id }
    );
    setPopup(response.data.message);
    setIsLoading(false);
    setCommunityDeletingState(false);
    navigate("/");
  };
  if (isLoading) {
    return <LinearProgress sx={{ backgroundColor: "black" }} />;
  }

  if (CommunityDeletingState) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div>
          <div className="flex flex-col gap-2 text-lg text-center items-center font-ubuntu font-medium">
            Do you really want to delete the community?
            <br />
            <span className="text-base font-normal text-rosemain">
              Note you can not get back the community
            </span>
            <span className="text-base font-normal text-rosemain">
              To confirm you deletion Type: "Delete community"
            </span>
          </div>
          <div>
            <input
              onChange={(e) => {
                setConfirmation(e.target.value);
              }}
              maxLength={25}
              className=" h-10 w-full my-5 text-semilight rounded-lg px-4 focus:outline-none border border-neutral-300"
            />
          </div>
          <div className="flex gap-5 justify-evenly items-center">
            <button
              onClick={deleteCommunity}
              className="text-semilight bg-rosemain font-normal px-4 py-1  rounded-lg"
            >
              Delete
            </button>

            <button
              onClick={() => {
                setCommunityDeletingState(false);
              }}
              className="text-black bg-dark hover:bg-neutral-200 font-normal px-4 py-1 border border-neutral-300 rounded-lg"
            >
              Cancel
            </button>
          </div>
          <div className="text-rosemain mt-5 font-light text-center text-sm my-2">
            {popup ? popup : "‎"}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="py-12">
      <NavBar />
      <div className="bg-dark h-fit mt-3 p-3 flex flex-col gap-4 rounded-lg">
        <div className="flex justify-between items-center border-b border-semidark pb-3">
          <button
            className="w-fit flex items-start"
            onClick={() => {
              navigate(`/community/${communityData.name}`);
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 30 }} className="text-light" />
          </button>
          <button
            onClick={() => {
              setCommunityDeletingState(true);
            }}
          >
            <div className="bg-rose-50 rounded-lg text-rosemain text-sm font-light py-1 px-4">
              Delete community
            </div>
          </button>
        </div>

        <div className="w-full flex justify-between items-end">
          <div className="flex justify-center items-center">
            <div className="absolute text-light z-50">
              <button>
                <label htmlFor="image-upload" className="cursor-pointer ">
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
                  : communityData.image
                  ? communityData.image
                  : "/user.png"
              }
              className="rounded-lg w-20 h-20 lg:w-24 lg:h-24  z-10"
            />
          </div>

          <button onClick={updateCommunity}>
            <div className="text-semilight bg-indigomain text-base font-light rounded-lg py-1 px-4">
              save
            </div>
          </button>
        </div>
        <div>
          <div className="text-semilight  text-sm font-light">Description</div>
          <textarea
            rows={2}
            className="w-full text-semilight bg-semidark px-2 py-1 text-base font-light resize-none no-scrollbar rounded-lg border border-semidark"
            defaultValue={communityData.description}
            wrap="soft"
            maxLength={150}
            onChange={(e) => {
              setNewDescription(e.target.value);
            }}
          />
        </div>

        {popup ? (
          <div className="text-rosemain font-ubuntu font-light text-center text-sm">
            {popup}
          </div>
        ) : (
          <div>‎</div>
        )}
      </div>
      <BottomBar />
    </div>
  );
};
