import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { BACKEND_URL } from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoadingPage } from "../LoadingPage";
export const CreatePost = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [post, setPost] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [popup, setPopup] = useState("");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setPostImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  async function createPost() {
    setPopup("");
    if (!post) {
      setPopup("Write something");
      return;
    }

    if (postImage == null) {
      try {
        setLoadingState(true);
        console.log(post);
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/post/create-text-post`,
          { token, post }
        );

        setPopup(response.data.message);
        setLoadingState(false);
        navigate("/home");

        return;
      } catch (error) {
        console.log(error);
        setPopup("netwoerk error");
      }
    }

    const file = postImage;
    const formdata = new FormData();
    formdata.append("image", file ? file : "");
    formdata.append("post", post ? post : "");
    formdata.append("token", token ? token : "");
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/create-full-post`,
        formdata
      );
      setLoadingState(false);
      setPopup(response.data.message);
      navigate("/home");
    } catch (error) {
      console.error("Error creating post:", error);
      setPopup("netwoerk error");
    }
  }

  return (
    <>
      {loadingState ? (
        <LoadingPage />
      ) : (
        <div className="h-screen w-full absolute bg-background">
          <div className="w-[80%] md:w-[45vw] absolute rounded-lg bg-background border border-neutral-200 shadow-md top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
            <button
              onClick={() => {
                setPost("");
                setPostImage(null);
                setPreviewImage("");
                navigate("/home");
              }}
            >
              <CloseIcon className="absolute -top-5 -left-5 text-secondarytextcolor" />
            </button>
            <div className="h-full flex flex-col justify-between">
              {postImage ? (
                <div className="flex justify-center items-center w-full">
                  <img
                    src={previewImage ? previewImage : ""}
                    alt="Profile"
                    className=" max-w-[60%] rounded-lg"
                  />
                </div>
              ) : (
                <div className="px-5 h-full">
                  <label htmlFor="image-upload" className="cursor-pointer ">
                    <div className="h-full p-5 gap-2 rounded-lg border border-dashed border-neutral-200 flex items-center justify-center">
                      <div className="text-secondarytextcolor">add picture</div>
                      <AddPhotoAlternateIcon className="text-secondarytextcolor" />
                    </div>
                  </label>
                  <input
                    onChange={handleImageChange}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              <div className="text-end flex flex-col px-5">
                <textarea
                  rows={4}
                  className="my-4 border border-neutral-200 resize-none focus:outline-none p-2 text-primarytextcolor rounded-lg"
                  placeholder="write your thoughts..."
                  wrap="soft"
                  minLength={10}
                  maxLength={250}
                  onChange={(e) => {
                    setPost(e.target.value);
                  }}
                />
                <button
                  onClick={createPost}
                  className="bg-background  hover:bg-neutral-50 text-primarytextcolor border border-neutral-200 px-6 py-2 rounded-lg"
                >
                  post
                </button>
                <div className="text-red-400 font-ubuntu font-light text-center text-sm my-2">
                  {popup ? popup : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
