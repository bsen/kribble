import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { CircularProgress } from "@mui/material";
export const CommentsPage = () => {
  const token = localStorage.getItem("token");
  const [commentDeleteId, setCommentDeleteId] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [postId, setPostId] = useState("");
  const [commentDeleteState, setCommentDeleteState] = useState(false);
  interface Comment {
    id: string;
    content: string;
    createdAt: string;
    creatorId: string;
    postId: string;
  }

  const [comments, setComments] = useState<{ comments: Comment[] }>({
    comments: [],
  });

  async function getComments() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/comments`,
        {
          token,
        }
      );
      setComments({ comments: response.data.message });
    } catch (error) {
      console.error(error);
    }
  }
  async function deleteComment() {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/server/v1/post/delete-comment`, {
        token,
        commentDeleteId,
        postId,
      });
      setLoadingState(false);
      setCommentDeleteState(false);
      setCommentDeleteId("");
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
        <div>
          {commentDeleteState ? (
            <div className="w-full h-[40vh] flex justify-center items-center">
              <div className="flex flex-col gap-4 text-base  items-center font-ubuntu font-semibold">
                Do you really want to delete the comment?
                <span className="text-xs font-light text-neutral-400">
                  note you can not get back the deleted comments!
                </span>
                <div className="flex gap-5">
                  <button
                    onClick={deleteComment}
                    className="text-white bg-red-500 hover:bg-red-600 font-semibold px-4 py-1  rounded-full"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setCommentDeleteState(false);
                      setCommentDeleteId("");
                    }}
                    className="text-black bg-background hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white">
              <div>
                {comments.comments.length > 0 ? (
                  comments.comments.map((comment, index) => (
                    <div
                      key={index}
                      className="border-b border-neutral-200 p-4 hover:bg-neutral-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-primarytextcolor flex justify-between gap-2  text-sm lg:text-base font-light">
                          {comment.content}
                          <div className="text-neutral-600">
                            <button
                              onClick={() => {
                                setCommentDeleteId(comment.id);
                                setPostId(comment.postId);
                                setCommentDeleteState(true);
                              }}
                            >
                              <MoreVertIcon sx={{ fontSize: 18 }} />
                            </button>
                          </div>
                        </div>
                        <div className="text-primarytextcolor flex items-center justify-between gap-2 text-sm font-light">
                          <Link to={`/post/${comment.postId}`}>
                            <OpenInNewIcon sx={{ fontSize: 18 }} />
                          </Link>
                          {comment.createdAt.slice(0, 10)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center font-ubuntu my-5 text-primarytextcolor">
                    No Comments found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};