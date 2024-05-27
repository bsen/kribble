import axios from "axios";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LinearProgress } from "@mui/material";
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
    return <LinearProgress sx={{ backgroundColor: "black" }} />;
  }

  return (
    <div>
      <div className="my-3 rounded-lg border border-semidark  bg-dark">
        {postData.image && (
          <img src={postData.image} className="rounded-t-lg w-[100%]" />
        )}

        {postData.content && (
          <div className="text-light my-6 px-3 font-ubuntu font-light text-base">
            {postData.content}
          </div>
        )}
        <div className="border-t border-semidark py-4 flex flex-col gap-4">
          <div className="flex w-full justify-between rounded-lg items-center px-3">
            <div className="flex gap-2 items-center">
              <div>
                <img
                  src={
                    postData.creator.image
                      ? postData.creator.image
                      : "/user.png"
                  }
                  alt="Profile"
                  className="w-7 h-7 rounded-lg"
                />
              </div>
              <div className="text-light text-sm lg:text-base font-normal">
                {postData.creator.username}
              </div>

              <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                · {getTimeDifference(postData.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 bg-dark rounded-lg">
        <textarea
          rows={3}
          className={`w-full bg-semidark text-semilight resize-none over overflow-auto no-scrollbar px-2 py-1 focus:outline-none rounded-xl  ${
            popup ? "border border-rosemain" : ""
          }`}
          wrap="soft"
          onChange={(e) => {
            setPopup(false);
            setComment(e.target.value);
          }}
          maxLength={250}
          placeholder="Post a reply"
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
              onClick={createComment}
              className="text-semilight text-base py-1 px-4 rounded-md bg-indigomain"
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};