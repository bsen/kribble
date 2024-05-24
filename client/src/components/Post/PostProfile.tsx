import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../config";
import { CircularProgress, LinearProgress } from "@mui/material";
import { NavBar } from "../Bars/NavBar";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { BottomBar } from "../Bars/BottomBar";
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  anonymity: boolean;
  creator: {
    username: string;
    image: string | null;
  };
}
export const PostProfile = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const ScrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getComments(cursor?: string) {
    try {
      setIsLoadingComments(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/post/comment/all/comments`,
        { token, postId, cursor }
      );
      if (cursor) {
        setPostComments((prevComments) => [
          ...prevComments,
          ...response.data.data,
        ]);
      } else {
        setPostComments(response.data.data);
      }
      setNextCursor(response.data.nextCursor);
      setIsLoadingComments(false);
    } catch (error) {
      console.log(error);
      setIsLoadingComments(false);
    }
  }

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      nextCursor &&
      !isLoadingComments
    ) {
      getComments(nextCursor);
    }
  };

  useEffect(() => {
    getComments();
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

  const [anonymity, setAnonymity] = useState(false);
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
      getComments();
      setComment("");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getPost();
  }, []);

  if (loadingState) {
    return <LinearProgress sx={{ backgroundColor: "black" }} />;
  }

  return (
    <div
      className="h-screen  overflow-y-auto no-scrollbar py-12 md:py-0"
      onScroll={handleScroll}
      ref={scrollContainerRef}
    >
      <NavBar />

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
                  className={`${
                    anonymity ? "text-rosemain" : "text-semilight"
                  }`}
                />
              </div>
              {anonymity ? (
                <div className="text-rosemain">
                  Your identity will be hidden
                </div>
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

      <div
        className="overflow-y-auto no-scrollbar touch-action-none"
        ref={ScrollContainerRef}
      >
        {postComments.length > 0 ? (
          postComments.map((comment, index) => (
            <div
              key={index}
              className="my-3 rounded-lg border border-semidark  bg-dark"
            >
              {comment.content && (
                <div className="text-light my-6 px-3 font-ubuntu font-light text-base">
                  {comment.content}
                </div>
              )}
              <div className="border-t border-semidark py-4 flex flex-col gap-4">
                <div className="flex w-full justify-between rounded-lg items-center px-3">
                  <div className="flex gap-2 items-center">
                    <div>
                      <img
                        src={
                          comment.creator.image
                            ? comment.creator.image
                            : "/user.png"
                        }
                        alt="Profile"
                        className="w-7 h-7 rounded-lg"
                      />
                    </div>
                    <div className="text-light text-sm lg:text-base font-normal">
                      {comment.anonymity ? (
                        <div className="text-light text-sm lg:text-base font-normal">
                          {comment.creator.username}
                        </div>
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${comment.creator.username}`);
                          }}
                          className="text-light text-sm lg:text-base hover:underline underline-offset-2 font-normal"
                        >
                          {comment.creator.username}
                        </div>
                      )}
                    </div>

                    <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                      · {getTimeDifference(comment.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>
            {isLoadingComments ? (
              <div className="w-full my-5 flex justify-center items-center">
                <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
              </div>
            ) : (
              <div className="text-semilight my-5 font-light text-center text-lg">
                No posts found
              </div>
            )}
          </div>
        )}
      </div>

      <BottomBar />
    </div>
  );
};
