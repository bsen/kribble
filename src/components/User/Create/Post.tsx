import { useCallback, useEffect, useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { BACKEND_URL } from "../../../config";
import { CircularProgress, LinearProgress } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import imageCompression from "browser-image-compression";
import SearchIcon from "@mui/icons-material/Search";
import { BottomBar } from "../../Bars/BottomBar";
import { NavBar } from "../../Bars/NavBar";

interface User {
  username: string;
  image: string;
}

export const Post = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [taggedUserName, setTaggedUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [anonymity, setAnonymity] = useState(false);
  const [popup, setPopup] = useState("");

  const [search, setSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isSearchState, setIsSearchState] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }
    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setPopup("File size is more than 10 MB");
      return;
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setPopup("Only PNG, JPG, and JPEG files are allowed");
      return;
    }
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1440,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = Math.max(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            if (file.type === "image/png") {
              ctx.fillStyle = "black";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            const x = (canvas.width - img.width) / 2;
            const y = (canvas.height - img.height) / 2;
            ctx.drawImage(img, x, y);
            const compressedImageData = canvas.toDataURL("image/jpeg");
            setPreviewImage(compressedImageData);
          }
        };
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleClose = () => {
    setContent("");
    setPreviewImage("");
    history.go(-1);
  };

  const createUserPost = async () => {
    setPopup("");
    if (!content) {
      setPopup("Write something");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("taggedUserName", taggedUserName);
      formData.append("content", content);
      formData.append("token", token || "");
      formData.append("anonymity", String(anonymity));
      if (previewImage) {
        const fileName = "post.jpeg";
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

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/user/post/create`,
        formData,
        config
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

  const fetchSearchResults = useCallback(async () => {
    setIsSearching(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/search/data`, {
        token,
        search,
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsSearching(false);
    }
  }, [token, search]);

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  }

  const debouncedSearch = useCallback(debounce(fetchSearchResults, 1000), [
    fetchSearchResults,
  ]);

  useEffect(() => {
    if (search.length !== 0) {
      debouncedSearch();
    } else {
      setUsers([]);
    }
  }, [search, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="w-full my-5 flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }

  if (isSearchState) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="bg-dark border border-semidark shadow-md h-[50vh] rounded-lg w-72 p-2 overflow-y-auto no-scrollbar">
          <div className="w-full h-12 flex justify-between gap-2 items-center">
            <div
              onClick={() => {
                setTaggedUserName("");
                setIsSearchState(false);
              }}
            >
              <CloseIcon className="text-semilight" sx={{ fontSize: 25 }} />
            </div>
            <div className="h-10 bg-semidark mx-auto w-full flex px-4 justify-between items-center rounded-lg">
              <input
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user"
                className="w-full h-full bg-semidark  text-semilight focus:outline-none"
              />
              <SearchIcon className="text-semilight" />
            </div>
          </div>
          {isSearching && <LinearProgress sx={{ backgroundColor: "black" }} />}
          <div>
            {users.length !== 0 ? (
              <div>
                {users.map((user) => (
                  <div
                    onClick={() => {
                      setTaggedUserName(user.username);
                      setIsSearchState(false);
                    }}
                    className="flex border my-1 bg-dark rounded-lg border-semidark py-1.5 justify-between items-center px-2 hover:bg-semidark"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={user.image ? user.image : "/user.png"}
                        alt="Profile"
                        className="h-7 w-7 rounded-lg"
                      />
                      <div className="text-light text-sm">{user.username}</div>
                    </div>
                    <AddIcon className="text-light" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {isSearching ? (
                  ""
                ) : (
                  <div className="text-semilight my-5 font-light text-center text-sm">
                    Search result not found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-12">
        <NavBar />
        <div className="w-full mt-2 bg-dark p-4 rounded-lg">
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
                    <DeleteIcon
                      sx={{ fontSize: 20 }}
                      className="text-semilight"
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-center my-2 h-20 rounded-lg bg-semidark flex items-center justify-center"
                >
                  <div className="h-[5vh] w-fit rounded-lg text-semilight text-sm gap-2 flex justify-center items-center">
                    Add Image
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

          <textarea
            value={content}
            onChange={handlePostChange}
            rows={4}
            className="w-full bg-semidark overflow-auto no-scrollbar resize-none hover:bg-semidark focus:outline-none px-2 py-1 text-semilight rounded-lg"
            placeholder="Write your thoughts..."
            wrap="soft"
            maxLength={500}
          />

          <div className="flex w-full my-2 justify-between items-center">
            <div className="flex gap-2 text-xs text-semilight w-fit justify-center items-center">
              <div
                onClick={() => {
                  setAnonymity((prevState) => !prevState);
                }}
              >
                <VisibilityOffIcon
                  className={`${
                    anonymity ? "text-rosemain" : "text-semilight"
                  }`}
                />
              </div>
              {anonymity ? <div className="text-rosemain">Anonymous</div> : ""}
            </div>

            <div className="flex items-center gap-4 text-light">
              {taggedUserName && (
                <div className="text-sm bg-semidark px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <div
                    onClick={() => {
                      setTaggedUserName("");
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 20 }} />
                  </div>{" "}
                  {taggedUserName}
                </div>
              )}
              {!taggedUserName && (
                <button
                  onClick={() => {
                    setTaggedUserName("");
                    setIsSearchState(true);
                  }}
                  className="text-sm bg-semidark px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <AddIcon sx={{ fontSize: 20 }} /> Tag
                </button>
              )}
              <button
                onClick={createUserPost}
                className="text-semilight text-base py-1 px-6 rounded-lg bg-indigomain"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {popup && (
          <div className="text-red-400 font-light text-center text-xs my-2">
            {popup}
          </div>
        )}
        <BottomBar />
      </div>
    </>
  );
};
