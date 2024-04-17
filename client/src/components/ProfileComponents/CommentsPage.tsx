// Client-side code
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useEffect, useState, useRef } from "react";
import { CircularProgress } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link } from "react-router-dom";

export const CommentsPage = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  interface Comment {
    id: string;
    content: string;
    createdAt: string;
    creatorId: string;
    postId: string;
  }

  async function getComments(cursor?: string) {
    try {
      setIsLoadingComments(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/comments`,
        {
          token,
          cursor,
        }
      );
      if (cursor) {
        setComments((prevComments) => [
          ...prevComments,
          ...response.data.message,
        ]);
      } else {
        setComments(response.data.message);
      }
      setNextCursor(response.data.nextCursor);
      setIsLoadingComments(false);
    } catch (error) {
      console.error(error);
      setIsLoadingComments(false);
    }
  }

  useEffect(() => {
    getComments();
  }, []);

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

  async function deleteComment(commentId: string, postId: string) {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/server/v1/post/delete-comment`, {
        token,
        commentDeleteId: commentId,
        postId,
      });
      setLoadingState(false);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getComments();
  }, []);

  return (
    <>
      {loadingState ? (
        <div className="h-[40vh] bg-background flex justify-center items-center w-full">
          <CircularProgress />
        </div>
      ) : (
        <div
          className="h-[65vh] overflow-y-auto no-scrollbar"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-neutral-200 p-4 hover:bg-neutral-50"
              >
                <div className="flex justify-between items-start ">
                  <div className="text-primarytextcolor w-[75%] flex   text-sm lg:text-base font-light">
                    {comment.content}
                  </div>
                  <div className="text-primarytextcolor w-[20%] flex items-center justify-between  text-sm font-light">
                    <Link to={`/post/${comment.postId}`}>
                      <OpenInNewIcon sx={{ fontSize: 18 }} />
                    </Link>
                    {comment.createdAt.slice(0, 10)}{" "}
                    <div className="text-neutral-600">
                      <button
                        onClick={() =>
                          deleteComment(comment.id, comment.postId)
                        }
                      >
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
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
            <div className="text-center my-5 text-gray-500">Loading ...</div>
          )}
        </div>
      )}
    </>
  );
};
