import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loading } from "../Loading";
import { BACKEND_URL } from "../../config";

const CreatePostComponent = () => {
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

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost(e.target.value);
  };

  const handleClose = () => {
    setPost("");
    setPostImage(null);
    setPreviewImage("");
    navigate("/home");
  };

  const createPost = async () => {
    setPopup("");
    if (!post) {
      setPopup("Write something");
      return;
    }

    try {
      setLoadingState(true);
      const formData = new FormData();
      formData.append("post", post);
      formData.append("token", token || "");
      if (postImage) {
        formData.append("image", postImage);
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/post/create-full-post`,
          formData
        );
        setPopup(response.data.message);
      } else {
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/post/create-text-post`,
          { token, post }
        );
        setPopup(response.data.message);
      }
      setLoadingState(false);
      navigate("/home");
    } catch (error) {
      console.error("Error creating post:", error);
      setPopup("Network error");
      setLoadingState(false);
    }
  };

  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div className="h-screen flex justify-center items-center">
          <div className="w-full max-w-md my-5 rounded-lg bg-background">
            <div>
              <button onClick={handleClose} className="my-5">
                <CloseIcon
                  className="bg-neutral-800 p-1 rounded-full text-white"
                  sx={{ fontSize: 30 }}
                />
              </button>
              {postImage ? (
                <div className="flex justify-center items-center">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-[50vh] h-auto rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block text-center"
                  >
                    <div className="h-20 border-dashed border border-secondarytextcolor rounded-lg gap-2 flex justify-center items-center">
                      <div className="text-secondarytextcolor">Add Picture</div>
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
              <textarea
                value={post}
                onChange={handlePostChange}
                rows={4}
                className="w-full my-4 border border-neutral-200 resize-none focus:outline-none p-2 text-primarytextcolor rounded-lg"
                placeholder="Write your thoughts..."
                wrap="soft"
                minLength={10}
                maxLength={300}
              />
              <div className="flex w-full justify-center">
                <button
                  onClick={createPost}
                  className="bg-black w-full hover:bg-neutral-900 text-white border border-neutral-200 px-6 py-2 rounded-lg"
                >
                  Post
                </button>
              </div>
              <div className="text-red-400 font-ubuntu font-light text-center text-sm my-2">
                {popup ? popup : ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePostComponent;
