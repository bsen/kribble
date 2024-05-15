import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import { NavBar } from "../Bars/NavBar";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
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

export const PostProfile = () => {
  const { postId } = useParams();
  const [anonymity, setAnonymity] = useState(false);
  const token = localStorage.getItem("token");
  const [popup, setPopup] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    getPost();
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
  return (
    <>
      {loadingState && <div className="my-4 text-center">Loading ...</div>}
      {!loadingState && (
        <>
          <div
            className="h-screen overflow-y-auto no-scrollbar py-14"
            onScroll={handleScroll}
            ref={scrollContainerRef}
          >
            <NavBar />
            <div className="bg-bgmain p-4 rounded-md">
              <div className="flex items-start gap-2 ">
                <div>
                  <Link to={`/${postData.creator.username}`}>
                    <img
                      src={
                        postData.creator.image
                          ? postData.creator.image
                          : "/user.png"
                      }
                      alt="Profile"
                      className="w-8 h-8  rounded-full"
                    />
                  </Link>
                </div>
                <div className="w-full">
                  <div className="flex gap-2 items-center">
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
                      className={`${
                        anonymity ? "text-indigomain" : "text-texttwo"
                      }`}
                    />
                  </div>
                  {anonymity
                    ? "Your identity will be hidden"
                    : "Hide your identity"}
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
            {postComments.map((comment) => (
              <div
                key={comment.id}
                className="my-2 p-4 border border-bordermain rounded-md bg-bgmain"
              >
                <div className="flex gap-2">
                  <div>
                    {comment.anonymity ? (
                      <img
                        src="/user.png"
                        alt="Anonymous"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <Link to={`/${comment.creator.username}`}>
                        <img
                          src={
                            comment.creator.image
                              ? comment.creator.image
                              : "/user.png"
                          }
                          alt="Profile"
                          className="w-8 h-8 rounded-full"
                        />
                      </Link>
                    )}
                  </div>
                  <div className="w-full">
                    <div className="flex gap-2 items-center">
                      {comment.anonymity ? (
                        <div className="text-textmain text-sm lg:text-base font-semibold">
                          {comment.creator.username}
                        </div>
                      ) : (
                        <Link to={`/${comment.creator.username}`}>
                          <div className="text-textmain text-sm lg:text-base hover:underline font-semibold">
                            {comment.creator.username}
                          </div>
                        </Link>
                      )}
                      <div className="text-texttwo text-xs lg:text-sm font-ubuntu">
                        · {getTimeDifference(comment.createdAt)}
                      </div>
                    </div>
                    <div className="text-textmain text-sm lg:text-base font-light">
                      {comment.content}
                    </div>
                    <div>
                      <div className="flex gap-2 text-texttwo"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoadingComments && (
              <div className="text-center my-5">
                <CircularProgress color="inherit" />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
