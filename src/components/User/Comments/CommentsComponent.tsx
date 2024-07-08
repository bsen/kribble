import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import { NavBar } from "../../Bars/NavBar";

interface Comment {
  id: string;
  caption: string;
  createdAt: string;
  creatorId: string;
  post: {
    id: string;
    caption: string;
    image: string;
    video: string;
  };
}
export const CommentsComponent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteState, setDeleteState] = useState(false);
  const [commentId, setCommentId] = useState("");
  const [postId, setPostId] = useState("");
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
      setIsLoading(true);
      await axios.post(`${BACKEND_URL}/api/user/comment/delete`, {
        token,
        commentId,
        postId,
      });
      setIsLoading(false);
      setDeleteState(false);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };
  if (isLoading) {
    return (
      <div className="w-full my-5 flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }
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
                setCommentId("");
                setPostId("");
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
      <NavBar />
      <div
        className="flex justify-center h-screen overflow-y-auto no-scrollbar py-14"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div className="w-full md:w-[35%] px-2">
          {commentsData.comments.length > 0 ? (
            commentsData.comments.map((comment, index) => (
              <div
                key={index}
                className="my-2 rounded-lg border border-semidark  bg-dark"
              >
                <div
                  onClick={() => {
                    navigate(`/post/${comment.post.id}`);
                  }}
                >
                  {comment.post.video ? (
                    <video controls className="w-[100%]">
                      <source src={comment.post.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : comment.post.image ? (
                    <img src={comment.post.image} className="w-[100%]" />
                  ) : null}
                  {comment.post.caption && (
                    <div className="text-light px-3 my-2 font-ubuntu font-light text-sm">
                      {comment.post.caption}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start text-light rounded-b-lg bg-semidark p-3 font-ubuntu font-light text-sm">
                  <div> {comment.caption}</div>

                  <div
                    onClick={() => {
                      setCommentId(comment.id);
                      setPostId(comment.post.id);
                      setDeleteState(true);
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 20 }} />
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
        </div>
      </div>
    </>
  );
};
