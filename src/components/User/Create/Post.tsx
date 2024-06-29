import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageIcon from "@mui/icons-material/Image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress, LinearProgress } from "@mui/material";
import imageCompression from "browser-image-compression";
import { BACKEND_URL } from "../../../config";
import { BottomBar } from "../../Bars/BottomBar";
import { NavBar } from "../../Bars/NavBar";
import { UserContext } from "../Context/UserContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface User {
  username: string;
  image: string;
}

interface PostCreatorProps {
  isCommunityPost: boolean;
  communityName?: string;
}

export const CreatePostComponent: React.FC<PostCreatorProps> = ({
  isCommunityPost,
  communityName,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem("token");
  const [taggedUserName, setTaggedUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [anonymity, setAnonymity] = useState(false);
  const [popup, setPopup] = useState("");
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isSearchState, setIsSearchState] = useState(false);

  const handleSearchingUsernameChange = (text: string) => {
    const searchingUsername = text.toLowerCase();
    setSearch(searchingUsername);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPopup("");
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }

    const maxFileSize = 15 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setPopup("Please ensure your video is under 15 MB.");
      return;
    }
    const allowedImageTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
    ];

    const allowedVideoTypes = ["video/mp4"];

    if (allowedImageTypes.includes(file.type)) {
      await handleImageUpload(file);
    } else if (allowedVideoTypes.includes(file.type)) {
      await handleVideoUpload(file);
    } else {
      setPopup("Only PNG, JPG, JPEG, GIF, and MP4 files are allowed");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      if (file.type === "image/gif") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
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
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setPopup("Error processing image");
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 90) {
          setPopup("Video length should be under 90 seconds");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewVideo(reader.result as string);
        };
        reader.readAsDataURL(file);
      };

      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Error handling video upload:", error);
      setPopup("Error uploading video");
    }
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPopup("");
    setCaption(e.target.value);
  };

  const createPost = async () => {
    setPopup("");
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("taggedUserName", taggedUserName);
      formData.append("caption", caption);
      formData.append("token", token || "");
      formData.append("anonymity", String(anonymity));

      if (isCommunityPost && communityName) {
        formData.append("communityName", communityName);
      }

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
      } else if (previewVideo) {
        const response = await fetch(previewVideo);
        const blob = await response.blob();
        formData.append("file", blob, "video.mp4");
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/post/create`,
        formData,
        config
      );

      setPopup(response.data.message);
      setIsLoading(false);
      if (isCommunityPost) {
        navigate(`/community/${communityName}`);
      } else {
        navigate(`/${currentUser}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setPopup("Network error");
      setIsLoading(false);
    }
  };

  const fetchSearchResults = useCallback(async () => {
    setIsSearching(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/search/users`, {
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

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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
                value={search}
                onChange={(e) => handleSearchingUsernameChange(e.target.value)}
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
          {isCommunityPost && (
            <div className="flex gap-4 items-center">
              <div className="text-base font-ubuntu w-full text-center items-center mb-4 font-light text-light">
                c/ {communityName}
              </div>
            </div>
          )}

          {(previewImage || previewVideo) && (
            <div>
              <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-4 text-light">
                  <button
                    onClick={() => {
                      setPreviewVideo(null);
                      setPreviewImage(null);
                    }}
                    className="text-black my-2 rounded-lg"
                  >
                    <ArrowBackIcon
                      sx={{ fontSize: 24 }}
                      className="text-semilight"
                    />
                  </button>
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
                    {anonymity ? (
                      <div className="text-rosemain">Anonymous</div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-light">
                  {taggedUserName && (
                    <div className="text-sm bg-semidark px-2 py-1 rounded-lg flex items-center gap-1">
                      <div
                        onClick={() => {
                          setTaggedUserName("");
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 20 }} />
                      </div>
                      {taggedUserName}
                    </div>
                  )}
                  {!taggedUserName && (
                    <button
                      onClick={() => {
                        setTaggedUserName("");
                        setIsSearchState(true);
                      }}
                      className="text-sm bg-semidark px-2 py-1 rounded-lg flex items-center gap-1"
                    >
                      <AddIcon sx={{ fontSize: 20 }} /> Tag
                    </button>
                  )}
                  <button
                    onClick={createPost}
                    className="text-semilight text-base py-0.5 px-4 rounded-lg bg-indigomain"
                  >
                    Post
                  </button>
                </div>
              </div>
              <textarea
                value={caption}
                onChange={handlePostChange}
                rows={2}
                className="mt-2 w-full bg-dark overflow-auto no-scrollbar resize-none focus:outline-none px-2 py-1 text-semilight"
                placeholder="Write your thoughts..."
                wrap="soft"
                maxLength={200}
              />
            </div>
          )}
          <div className="w-full h-full  flex flex-col justify-center">
            {previewImage ? (
              <div className="flex w-full flex-col items-center">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full border border-semidark"
                />
              </div>
            ) : previewVideo ? (
              <div className="flex w-full flex-col items-center">
                <div className="relative w-full aspect-square overflow-hidden">
                  <video
                    ref={videoRef}
                    src={previewVideo}
                    loop
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover border border-semidark"
                    onClick={togglePlay}
                  />
                  {!isPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                      onClick={togglePlay}
                    >
                      <PlayArrowIcon
                        className="text-white"
                        style={{ fontSize: 60 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-center h-40 rounded-lg bg-semidark flex items-center justify-center"
                >
                  <div className="w-fit rounded-lg text-semilight text-base gap-2 flex justify-center items-center">
                    Select photo or video
                    <ImageIcon sx={{ fontSize: 30 }} className="text-light" />
                  </div>
                </label>
                <input
                  onChange={handleFileUpload}
                  id="file-upload"
                  type="file"
                  accept="image/*, video/*"
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {popup && (
          <div className="text-rosemain font-light text-center text-xs my-2">
            {popup}
          </div>
        )}
        <BottomBar />
      </div>
    </>
  );
};
