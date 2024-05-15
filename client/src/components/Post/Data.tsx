import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
export const Data = () => {
  interface PostData {
    image: string;
    content: string;
    creatorId: string;
    createdAt: string;
    creator: {
      username: string;
      image: string | null;
    };
  }

  const { postId } = useParams();
  const [anonymity, setAnonymity] = useState(false);
  const token = localStorage.getItem("token");
  const [popup, setPopup] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [postData, setPostData] = useState<PostData>({
    image: "",
    content: "",
    creatorId: "",
    createdAt: "",
    creator: {
      username: "",
      image: "",
    },
  });

  async function getPost() {
    try {
      setLoadingState(true);
      const response = await axios.post(`${BACKEND_URL}/api/post/data`, {
        token,
        postId,
      });
      setLoadingState(false);
      setPostData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function createComment() {
    try {
      if (!comment) {
        setPopup(true);
        return;
      }

      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/user/comment/create`, {
        token,
        postId,
        comment,
        anonymity,
      });
      setLoadingState(false);
      window.location.reload();
      setComment("");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getPost();
  }, []);

  const getTimeDifference = (createdAt: string) => {
    const currentDate = new Date();
    const postDate = new Date(createdAt);
    const timeDifference = currentDate.getTime() - postDate.getTime();
    const hoursDifference = Math.floor(timeDifference / (1000 * 3600));
    const daysDifference = Math.floor(hoursDifference / 24);
    if (daysDifference >= 30) {
      return postDate.toDateString();
    } else if (daysDifference >= 1) {
      return `${daysDifference}d ago`;
    } else if (hoursDifference >= 1) {
      return `${hoursDifference}h ago`;
    } else {
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));
      return `${minutesDifference}m ago`;
    }
  };

  if (loadingState) {
    return (
      <div className="text-texttwo my-5  font-light text-center text-lg">
        Loading ...
      </div>
    );
  }

  return (
    <div className="bg-bgmain mt-4 border border-bordermain p-2 rounded-md">
      <div className="flex gap-2 items-center">
        <Link to={`/${postData.creator.username}`}>
          <img
            src={postData.creator.image ? postData.creator.image : "/user.png"}
            alt="Profile"
            className="w-9 h-9  rounded-full"
          />
        </Link>

        <Link to={`/${postData.creator.username}`}>
          <div className="text-textmain text-sm lg:text-base hover:underline font-semibold">
            {postData.creator.username}
          </div>
        </Link>
        <div className="text-texttwo text-xs lg:text-sm font-ubuntu">
          · {getTimeDifference(postData.createdAt)}
        </div>
      </div>

      <div className="flex flex-col gap-1 py-4 w-full">
        {postData.image && (
          <img
            src={postData.image}
            className="max-w:w-[100%] lg:max-w-[50%] rounded-lg border border-bordermain"
          />
        )}

        <div className="text-textmain text-sm lg:text-base font-light">
          {postData.content}
        </div>
      </div>

      <div className="bg-bgmain  flex justify-center items-center">
        <textarea
          rows={3}
          className={`w-full border border-bordermain resize-none over overflow-auto no-scrollbar px-2 py-1 focus:outline-none rounded-xl  ${
            popup ? "border border-rose-400" : ""
          }`}
          wrap="soft"
          onChange={(e) => {
            setPopup(false);
            setComment(e.target.value);
          }}
          maxLength={250}
          placeholder="Post a reply"
        />
      </div>

      <div className="flex w-full my-2 justify-between">
        <div className="flex gap-2 text-xs text-texttwo w-fit justify-center items-center">
          <div
            onClick={() => {
              setAnonymity((prevState) => !prevState);
            }}
          >
            <VisibilityOffIcon
              className={`${anonymity ? "text-textmain" : "text-texttwo"}`}
            />
          </div>
          {anonymity ? (
            <div className="text-textmain">Your identity will be hidden</div>
          ) : (
            <div className="text-texttwo">Hide your identity</div>
          )}
        </div>
        <div>
          <button
            onClick={createComment}
            className="text-textmain text-base py-1 px-4 rounded-md bg-indigomain"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};
