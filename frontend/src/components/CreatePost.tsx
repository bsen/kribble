import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const CreatePost = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [post, setPost] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setPostImage(file);
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  async function createPost() {
    if (post.length < 10) {
      alert("post has to be minimum 10 characters");
      return;
    }
    if (postImage == null) {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/post/create-text-post`,
          { post }
        );
        if (response.data.status == 200) {
          alert("post created successfully");
        }

        return;
      } catch (error) {
        console.log(error);
      }
    }

    const file = postImage;
    const formdata = new FormData();
    formdata.append("image", file ? file : "");
    formdata.append("post", post ? post : "");
    formdata.append("token", token ? token : "");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/create-full-post`,
        formdata
      );

      if (response.data.status === 200) {
        alert("post created");
      } else {
        alert("network error");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }

  return (
    <>
      <div className="h-screen w-full absolute bg-neutral-900">
        <div className="h-auto w-[30vw] absolute rounded-lg bg-white shadow-md top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
          <button
            onClick={() => {
              setPost("");
              setPostImage(null);
              setPreviewImage("");
              navigate("/home");
            }}
          >
            <CloseIcon className="absolute -top-5 -left-5 text-white" />
          </button>
          <div className="h-full flex flex-col justify-between">
            {postImage ? (
              <div className="flex justify-center items-center w-full">
                <img
                  src={previewImage ? previewImage : ""}
                  alt="Profile"
                  className="max-h-[40vh] max-w-[80%] rounded-lg"
                />
              </div>
            ) : (
              <div className="px-5">
                <label htmlFor="image-upload" className="cursor-pointer ">
                  <div className="h-full p-5 gap-2 bg-white rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
                    <div className="text-neutral-700">add picture</div>
                    <AddPhotoAlternateIcon className="text-neutral-700" />
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

            <div className="text-end flex flex-col p-5">
              <textarea
                rows={4}
                className=" border border-neutral-300 resize-none focus:outline-none p-2 text-neutral-700 rounded-lg"
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
                className="bg-black my-4  hover:bg-neutral-900 text-white border border-neutral-300 px-6 py-2 rounded-lg"
              >
                post
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
