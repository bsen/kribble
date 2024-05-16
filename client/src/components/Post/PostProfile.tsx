import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import { NavBar } from "../Bars/NavBar";
import { Data } from "./Data";
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

  return (
    <div
      className="h-screen p-2 overflow-y-auto no-scrollbar py-12 md:py-0"
      onScroll={handleScroll}
      ref={scrollContainerRef}
    >
      <NavBar />

      <Data />
      <div
        className="overflow-y-auto no-scrollbar touch-action-none"
        ref={ScrollContainerRef}
      >
        {postComments.map((comment) => (
          <div
            key={comment.id}
            className="my-3 p-3 rounded-md border border-bordermain bg-bgpost"
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
      </div>
      <div>
        {isLoadingComments && (
          <div className="w-full my-5 flex justify-center items-center">
            <CircularProgress />
          </div>
        )}
      </div>

      <BottomBar />
    </div>
  );
};
