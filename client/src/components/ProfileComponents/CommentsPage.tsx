import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
export const CommentsPage = () => {
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    getComments();
  }, []);

  return (
    <div className="text-white">
      <div>
        {comments.comments.length > 0 ? (
          comments.comments.map((comment, index) => (
            <div className="border-b border-neutral-200 py-2 px-4 hover:bg-neutral-50">
              <div className="flex justify-between items-start">
                <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
                  {comment.content}
                </div>
                <div className="text-primarytextcolor flex items-center justify-between gap-2 my-2 text-sm font-light">
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
  );
};
