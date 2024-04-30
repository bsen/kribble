// Client-side code
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Loading } from "../Loading";
import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  creator: {
    username: string;
    name: string;
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
    name: string;
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
      name: "",
      image: "",
    },
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function getPost() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/post-data`,
        { token, postId }
      );
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
        `${BACKEND_URL}/api/server/v1/post/post-comments`,
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
      await axios.post(`${BACKEND_URL}/api/server/v1/post/create-comment`, {
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

  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <>
          <div
            className="h-screen overflow-y-auto no-scrollbar"
            onScroll={handleScroll}
            ref={scrollContainerRef}
          >
            <div className="flex flex-col gap-2  p-4 border-b border-neutral-200 ">
              <div className="flex gap-2 items-center">
                <Link to={`/${postData.creator.username}`}>
                  <img
                    src={
                      postData.creator.image
                        ? postData.creator.image
                        : "/user.png"
                    }
                    alt="Profile"
                    className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                  />
                </Link>
                <div className="w-[80%]">
                  <Link to={`/${postData.creator.username}`}>
                    <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                      {postData.creator.name}
                    </div>
                  </Link>
                  <div className="flex gap-2 items-center">
                    <Link to={`/${postData.creator.username}`}>
                      <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                        @{postData.creator.username}
                      </div>
                    </Link>
                    <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                      · {postData.createdAt.slice(0, 10)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div>
                  {postData.image ? (
                    <img
                      src={postData.image}
                      className="max-w-[80%]   rounded-lg border border-neutral-200"
                    />
                  ) : (
                    ""
                  )}
                </div>
                <div className="text-primarytextcolor text-sm lg:text-base my-2 font-light">
                  {postData.content}
                </div>
              </div>
            </div>
            <div className="p-4 border-b border-neutral-200 flex justify-center items-center">
              <div className="w-full">
                <textarea
                  rows={2}
                  className={`w-full p-2 focus:outline-none rounded-xl  ${
                    popup ? "border border-rose-200" : ""
                  }`}
                  wrap="soft"
                  onChange={(e) => {
                    setPopup(false);
                    setComment(e.target.value);
                  }}
                  maxLength={300}
                  placeholder="Post a reply"
                />
                <div>
                  <button
                    onClick={createComment}
                    className="text-white my-2 py-1 px-4 rounded-full bg-blue-500"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            {postComments.map((comment) => (
              <div key={comment.id} className="p-3 border-b border-neutral-200">
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
                        className="w-8 h-8 lg:h-10 lg:w-10 rounded-full"
                      />
                    </Link>
                  </div>
                  <div className="w-[80%]">
                    <Link to={`/${comment.creator.username}`}>
                      <div className="text-primarytextcolor text-sm lg:text-base hover:underline font-semibold">
                        {comment.creator.name}
                      </div>
                    </Link>
                    <div className="flex gap-2 items-center">
                      <Link to={`/${comment.creator.username}`}>
                        <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                          @{comment.creator.username}
                        </div>
                      </Link>
                      <div className="text-secondarytextcolor text-xs lg:text-sm font-ubuntu">
                        · {comment.createdAt.slice(0, 10)}
                      </div>
                    </div>
                    <div className="text-primarytextcolor my-2 text-sm lg:text-base font-light">
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
                <CircularProgress />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
