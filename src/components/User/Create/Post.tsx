import { useEffect, useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import { CircularProgress } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

interface MatchData {
  id: string;
  task: string;
  isTaskCompleted: boolean;
  expiresAt: string;
  matchedUser: {
    id: string;
    username: string;
    image: string;
  };
}

export const Post = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [taggedUser, setTaggedUser] = useState("");
  const [taskId, setTaskId] = useState("");
  const [task, setTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMatches, setShowMatches] = useState(true);
  const [post, setPost] = useState("");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [anonymity, setAnonymity] = useState(false);
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

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost(e.target.value);
  };

  const handleClose = () => {
    setPost("");
    setPreviewImage("");
    history.go(-1);
  };

  const createUserPost = async () => {
    setPopup("");
    if (!post) {
      setPopup("Write something");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("taskId", taskId ? taskId : "");
      formData.append("taggedUser", taggedUser);
      formData.append("post", post);
      formData.append("token", token || "");
      formData.append("anonymity", String(anonymity));
      if (previewImage) {
        const fileName = "croppedImage.jpeg";
        const fileType = "image/jpeg";
        const binaryString = atob(previewImage.split(",")[1]);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: fileType });
        const file = new File([blob], fileName, { type: fileType });
        formData.append("image", file);
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/user/post/create`,
        formData
      );
      setPopup(response.data.message);
      setIsLoading(false);
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      setPopup("Network error");
      setIsLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/match/matches`, {
        token,
      });
      setIsLoading(false);
      if (response.data.status === 200) {
        setMatches(response.data.data);
      }
    } catch (error) {
      console.error("Error while fetching matches:", error);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);
  const getFormattedRemainingTime = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt);
    const currentDate = new Date();
    const diffInMilliseconds = expirationDate.getTime() - currentDate.getTime();

    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}h ${formattedMinutes}m remaining`;
  };
  if (isLoading) {
    return (
      <div className="w-full my-5 flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }
  return (
    <>
      <div className="w-full bg-dark p-4 rounded-lg">
        <div className="flex gap-4 items-center">
          <button onClick={handleClose}>
            <ArrowBackIcon
              className="p-1 bg-indigomain text-semilight rounded-lg"
              sx={{ fontSize: 35 }}
            />
          </button>
          <div className="text-xl flex justify-center items-center gap-5 font-light text-semilight text-center">
            <div>Create Post</div>
          </div>
        </div>
        <div className="w-full h-full rounded-lg flex flex-col justify-center">
          {previewImage ? (
            <div className="w-[100%] flex items-end justify-center p-4">
              <div className="flex flex-col items-center">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w:w-[80%] lg:max-w-[50%] rounded-lg border border-semidark"
                />
                <button
                  onClick={() => {
                    setPreviewImage("");
                  }}
                  className="text-black mt-2 rounded-lg"
                >
                  <DeleteIcon sx={{ fontSize: 25 }} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <label
                htmlFor="image-upload"
                className="cursor-pointer block text-center"
              >
                <div className="h-[5vh] w-fit rounded-lg text-semilight text-sm gap-2 flex justify-center items-center">
                  Add photo
                  <AddPhotoAlternateIcon
                    sx={{ fontSize: 30 }}
                    className="text-light"
                  />
                </div>
              </label>
              <input
                onChange={handleImageUpload}
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>
          )}
        </div>
        {taggedUser && task && (
          <div className="p-3 bg-semidark rounded-lg mb-2">
            <div className="text-light font-light  text-sm">
              Tagging @{taggedUser}
              <br />
              Task: {task}
            </div>
          </div>
        )}

        <textarea
          value={post}
          onChange={handlePostChange}
          rows={3}
          className="w-full bg-semidark overflow-auto no-scrollbar resize-none hover:bg-semidark focus:outline-none px-2 py-1 text-semilight rounded-lg"
          placeholder="Write your thoughts..."
          wrap="soft"
          maxLength={250}
        />

        <div className="flex w-full my-2 justify-between">
          <div className="flex gap-2 text-xs text-semilight w-fit justify-center items-center">
            <div
              onClick={() => {
                setAnonymity((prevState) => !prevState);
              }}
            >
              <VisibilityOffIcon
                className={`${anonymity ? "text-rosemain" : "text-semilight"}`}
              />
            </div>
            {anonymity ? (
              <div className="text-rosemain">Your identity will be hidden</div>
            ) : (
              <div className="text-semilight">Hide your identity</div>
            )}
          </div>
          <div>
            <button
              onClick={createUserPost}
              className="text-semilight text-base py-1 px-6 rounded-lg bg-indigomain"
            >
              Post
            </button>
          </div>
        </div>
      </div>
      <div className=" my-2 rounded-lg text-semilight">
        <div className="flex flex-col gap-4">
          <div className="my-2 text-semilight font-ubuntu font-light text-center">
            Tag matches
          </div>
          {matches.length > 0 &&
            showMatches &&
            matches.map((match) => (
              <div key={match.id}>
                <div className="bg-dark p-3 rounded-lg shadow-sm">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="flex gap-2 items-center justify-center">
                      <img
                        src={
                          match.matchedUser.image
                            ? match.matchedUser.image
                            : "/user.png"
                        }
                        className="w-7 h-7 rounded-lg border border-semidark object-cover"
                      />
                      <div
                        onClick={() => {
                          navigate(
                            `/${
                              match.matchedUser.username
                                ? match.matchedUser.username
                                : ""
                            }`
                          );
                        }}
                        className="text-light w-fit font-medium hover:underline underline-offset-2  text-lg rounded-full"
                      >
                        {match.matchedUser ? match.matchedUser.username : ""}
                      </div>
                    </div>
                    {!match.isTaskCompleted && (
                      <button
                        onClick={() => {
                          setTaggedUser(match.matchedUser.username);
                          setTaskId(match.id);
                          setTask(match.task);
                          setShowMatches(false);
                        }}
                        className="text-indigomain active:bg-semilight bg-light px-2 w-fit font-medium flex items-center  text-sm rounded-full"
                      >
                        <AddIcon /> Tag
                      </button>
                    )}
                  </div>
                  <div className="text-left font-light mb-2 text-semilight text-sm">
                    Task: {match.task}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-semilight">
                    <div className="text-left font-light">
                      {match.isTaskCompleted ? (
                        <div className="text-green-400">Task Completed</div>
                      ) : (
                        <div className="text-rose-400">Task Pending</div>
                      )}
                    </div>
                    <div>· {getFormattedRemainingTime(match.expiresAt)}</div>{" "}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      {popup && (
        <div className="text-red-400 font-light text-center text-xs my-2">
          {popup}
        </div>
      )}
    </>
  );
};
