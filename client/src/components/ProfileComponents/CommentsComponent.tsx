import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { SearchBox } from "../HomeComponents/SearchBar";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../config";

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

  const commentsScrollContainerRef = useRef<HTMLDivElement>(null);
  const [commentsData, setCommentsData] = useState<{
    comments: Comment[];
    nextCursor: string | null;
  }>({
    comments: [],
    nextCursor: null,
  });
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    getComments(null, true);
  }, []);

  const getComments = async (
    cursor: string | null | undefined,
    truncate: boolean
  ) => {
    try {
      setIsLoadingComments(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/comments`,
        {
          token,
          cursor,
        }
      );

      setCommentsData((prevComments) => ({
        comments: truncate
          ? [...response.data.comments]
          : [...prevComments.comments, ...response.data.comments],
        nextCursor: response.data.nextCursor,
      }));

      setIsLoadingComments(false);
    } catch (error) {
      console.error(error);
      setIsLoadingComments(false);
    }
  };

  const handleScroll = () => {
    const commentsScrollContainer = commentsScrollContainerRef.current;
    if (
      commentsScrollContainer &&
      commentsScrollContainer.scrollTop +
        commentsScrollContainer.clientHeight >=
        commentsScrollContainer.scrollHeight &&
      commentsData.nextCursor &&
      !isLoadingComments
    ) {
      getComments(commentsData.nextCursor, false);
    }
  };
  const deleteComment = async () => {
    try {
      setIsLoadingComments(true);
      await axios.post(`${BACKEND_URL}/api/server/v1/post/delete-comment`, {
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
  return (
    <>
      {deleteState ? (
        <div className="w-full h-screen flex justify-center items-center">
          <div className="flex flex-col gap-4 text-base  items-center font-ubuntu font-semibold">
            Do you really want to delete the post
            <span className="text-xs font-light text-neutral-600">
              note you can not get back the deleted item!
            </span>
            <div className="flex gap-5">
              <button
                onClick={deleteComment}
                className="text-white bg-red-500 hover:bg-red-400 font-semibold px-4 py-1  rounded-full"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setDeleteState(false);
                  setDeleteCommentId("");
                  setDeleteCommentPostId("");
                }}
                className="text-black bg-background hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="h-screen overflow-y-auto no-scrollbar py-14"
          onScroll={handleScroll}
          ref={commentsScrollContainerRef}
        >
          <SearchBox />
          {commentsData.comments.length > 0 ? (
            commentsData.comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-neutral-200 p-4 hover:bg-neutral-50"
              >
                <div className="flex flex-col gap-2 ">
                  <div className="text-primarytextcolor w-max flex items-center justify-between gap-2 text-sm font-light">
                    <Link to={`/post/${comment.postId}`}>
                      <OpenInNewIcon
                        sx={{ fontSize: 20 }}
                        className="text-blue-500"
                      />
                    </Link>
                    {comment.createdAt.slice(0, 10)}{" "}
                    <div className="text-neutral-600">
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
                  <div className="text-primarytextcolor  text-sm lg:text-base font-light">
                    {comment.content}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center font-ubuntu my-5 text-primarytextcolor">
              No Comments found.
            </div>
          )}
          {isLoadingComments && (
            <div className="text-center my-5 text-gray-500">
              <CircularProgress />
            </div>
          )}
        </div>
      )}
    </>
  );
};
