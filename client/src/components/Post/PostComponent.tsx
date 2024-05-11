import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import { NavBar } from "../Bars/NavBar";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
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

export const PostComponent = () => {
  const { postId } = useParams();
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
      {!loadingState && (
        <>
          <div
            className="h-screen overflow-y-auto no-scrollbar py-14"
            onScroll={handleScroll}
            ref={scrollContainerRef}
          >
            <NavBar />
            <div className="flex items-start mt-2 gap-2 bg-white border border-neutral-100 p-4 rounded-md ">
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
                    <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                      {postData.creator.username}
                    </div>
                  </Link>
                  <div className="text-neutral-600 text-xs lg:text-sm font-ubuntu">
                    · {getTimeDifference(postData.createdAt)}
                  </div>
                </div>

                <div className="flex flex-col gap-1 py-4 w-full">
                  {postData.image && (
                    <img
                      src={postData.image}
                      className="max-w:w-[100%] lg:max-w-[50%] rounded-lg border border-neutral-100"
                    />
                  )}

                  <div className="text-primarytextcolor text-sm lg:text-base font-light">
                    {postData.content}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-2 my-2 rounded-md border border-neutral-100 flex justify-center items-center">
              <div className="w-full">
                <textarea
                  rows={3}
                  className={`w-full resize-none no-scrollbar px-2 py-1 focus:outline-none rounded-xl  ${
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
                <div className="flex justify-end">
                  <button
                    onClick={createComment}
                    className="text-white text-base py-1 px-6 rounded-md bg-indigo-600"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            {postComments.map((comment) => (
              <div
                key={comment.id}
                className="my-2 p-4 border border-neutral-100 rounded-md bg-white"
              >
                <div className="flex gap-2">
                  <div>
                    <Link to={`/${comment.creator.username}`}>
                      <img
                        src={
                          comment.creator.image
                            ? comment.creator.image
                            : "/user.png"
                        }
                        alt="Profile"
                        className="w-8 h-8  rounded-full"
                      />
                    </Link>
                  </div>
                  <div className="w-full">
                    <div className="flex gap-2 items-center">
                      <Link to={`/${comment.creator.username}`}>
                        <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                          {comment.creator.username}
                        </div>
                      </Link>
                      <div className="text-neutral-600 text-xs lg:text-sm font-ubuntu">
                        · {getTimeDifference(comment.createdAt)}
                      </div>
                    </div>
                    <div className="text-primarytextcolor text-sm lg:text-base font-light">
                      {comment.content}
                    </div>
                    <div>
                      <div className="flex gap-2 text-neutral-600"></div>
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
