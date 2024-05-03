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

    const commentsScrollContainer = commentsScrollContainerRef.current;
    if (commentsScrollContainer) {
      commentsScrollContainer.addEventListener("scroll", handleScrollOrTouch);
      window.addEventListener("touchmove", handleScrollOrTouch);
    }

    return () => {
      if (commentsScrollContainer) {
        commentsScrollContainer.removeEventListener(
          "scroll",
          handleScrollOrTouch
        );
        window.removeEventListener("touchmove", handleScrollOrTouch);
      }
    };
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

  const handleScrollOrTouch = (event: any) => {
    const commentsScrollContainer = commentsScrollContainerRef.current;
    if (!commentsScrollContainer) return;

    const isScrollEvent = event.type === "scroll";
    const isScrolledToBottom = isScrollEvent
      ? commentsScrollContainer.scrollTop +
          commentsScrollContainer.clientHeight >=
        commentsScrollContainer.scrollHeight
      : window.innerHeight + window.pageYOffset >=
        document.documentElement.offsetHeight;

    if (isScrolledToBottom && commentsData.nextCursor && !isLoadingComments) {
      getComments(commentsData.nextCursor, false);
    }
  };

  return (
    <>
      <div
        className="h-screen overflow-y-auto touch-action-none no-scrollbar py-14"
        onScroll={handleScrollOrTouch}
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
                    <button onClick={() => {}}>
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
    </>
  );
};
