import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import { NavBar } from "../../Bars/NavBar";
import { BottomBar } from "../../Bars/BottomBar";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  creatorId: string;
  postId: string;
}

export const CommentsComponent = () => {
  const token = localStorage.getItem("token");
  const [deleteState, setDeleteState] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState("");
  const [deleteCommentPostId, setDeleteCommentPostId] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [commentsData, setCommentsData] = useState<{
    comments: Comment[];
    nextCursor: string | null;
  }>({
    comments: [],
    nextCursor: null,
  });
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    getComments();
  }, []);

  const getComments = async (cursor?: string) => {
    try {
      setIsLoadingComments(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/comment/all/comments`,
        {
          token,
          cursor,
        }
      );
      console.log(response.data.data);
      setCommentsData({
        comments: [...commentsData.comments, ...response.data.comments],
        nextCursor: response.data.nextCursor,
      });

      setIsLoadingComments(false);
    } catch (error) {
      console.error(error);
      setIsLoadingComments(false);
    }
  };

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      commentsData.nextCursor &&
      !isLoadingComments
    ) {
      getComments(commentsData.nextCursor);
    }
  };
  const deleteComment = async () => {
    try {
      setIsLoadingComments(true);
      await axios.post(`${BACKEND_URL}/api/user/comment/delete`, {
        token,
        deleteCommentId,
        deleteCommentPostId,
      });
      window.location.reload();
      setIsLoadingComments(false);
    } catch (error) {
      console.log(error);
    }
  };
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
  if (deleteState) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="flex text-light flex-col gap-4 text-center text-sm items-center font-ubuntu font-normal">
          Do you really want to delete the comment ?<br /> note that you can not
          get back the deleted comment
          <div className="flex gap-5">
            <button
              onClick={deleteComment}
              className="text-light bg-rosemain font-normal px-4 py-1  rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setDeleteState(false);
                setDeleteCommentId("");
                setDeleteCommentPostId("");
              }}
              className="text-dark bg-semilight font-normal px-4 py-1 border border-neutral-300 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div
        className="h-screen overflow-y-auto no-scrollbar py-12 "
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        {commentsData.comments.length > 0 ? (
          commentsData.comments.map((comment, index) => (
            <div
              key={index}
              className="border bg-dark my-2 rounded-lg border-semidark p-4 hover:bg-dark"
            >
              <div className="flex flex-col gap-2 ">
                <div className="text-light w-full flex items-center justify-between gap-2 text-sm font-light">
                  <div className="flex gap-2 items-center">
                    <Link to={`/post/${comment.postId}`}>
                      <OpenInNewIcon
                        sx={{ fontSize: 18 }}
                        className="text-indigomain"
                      />
                    </Link>
                    <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                      · {getTimeDifference(comment.createdAt)}
                    </div>
                  </div>
                  <div className="text-semilight">
                    <button
                      onClick={() => {
                        setDeleteCommentId(comment.id);
                        setDeleteCommentPostId(comment.postId);
                        setDeleteState(true);
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
                <div className="text-light  text-sm lg:text-base font-light">
                  {comment.content}
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
              <div className="text-semilight my-5 font-light text-center text-sm">
                No Comments found
              </div>
            )}
          </div>
        )}

        <BottomBar />
      </div>
    </>
  );
};
