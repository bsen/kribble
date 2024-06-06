import { useState, useEffect, useRef } from "react";
import { NavBar } from "../Bars/NavBar";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { CircularProgress } from "@mui/material";
import validUrl from "valid-url";
import { BottomBar } from "../Bars/BottomBar";

interface CityTalksPost {
  id: string;
  description: string;
  meetingLink: string;
  createdAt: string;
  expiresAt: string;
  user: {
    username: string;
    image: string | null;
  };
}

export const CityTalksComponent = () => {
  const token = localStorage.getItem("token");
  const [writingState, setWritingState] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [meetLink, setMeetLink] = useState<string>("");
  const [popup, setPopup] = useState<string>("");
  const [isLoadingCityTalksPosts, setIsLoadingCityTalksPosts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cityTalksPosts, setCityTalksPosts] = useState<CityTalksPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getFormattedRemainingTime = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt);
    const currentDate = new Date();
    const diffInMilliseconds = expirationDate.getTime() - currentDate.getTime();

    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}h ${formattedMinutes}m remaining`;
  };

  const CreateCityTalkPost = async () => {
    if (!validUrl.isUri(meetLink)) {
      return setPopup("Please provide a valid meeting link");
    }
    if (!description) {
      return setPopup("Please write the description");
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/citytalks/create`, {
        token,
        description,
        meetLink,
      });
      setPopup(response.data.message);
      if (response.data.status === 200) {
        setWritingState(false);
        setDescription("");
        setMeetLink("");
        getCityTalksPosts();
      }
      getCityTalksPosts();
    } catch (error) {
      setPopup("An error occurred while creating the post");
    } finally {
      setIsLoading(false);
    }
  };

  const getCityTalksPosts = async (cursor?: string) => {
    setIsLoadingCityTalksPosts(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/citytalks/all/posts`,
        {
          token,
          cursor,
        }
      );
      if (cursor) {
        setCityTalksPosts((prevPosts) => [...prevPosts, ...response.data.data]);
      } else {
        setCityTalksPosts(response.data.data);
      }
      setNextCursor(response.data.nextCursor);
    } catch (error) {
      setPopup("Failed to load posts");
    } finally {
      setIsLoadingCityTalksPosts(false);
    }
  };

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      nextCursor &&
      !isLoadingCityTalksPosts
    ) {
      getCityTalksPosts(nextCursor);
    }
  };

  useEffect(() => {
    setPopup("");
    getCityTalksPosts();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full my-5 flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto flex flex-col items-center no-scrollbar py-12">
      <NavBar />
      {!writingState && (
        <div className="w-full mb-3 flex flex-col items-center text-semilight bg-dark text-center text-sm font-normal mt-3 font-ubuntu p-2 rounded-lg">
          <div>
            From study tips 📚 to finding the best pizza 🍕, Connect for
            detailed discussions, share insights, and arrange meetups with a
            quick meeting link.
          </div>
          <button
            onClick={() => setWritingState(true)}
            className="bg-indigomain mt-5 text-center text-semilight px-4 font-ubuntu font-normal py-0.5 text-sm rounded-lg"
          >
            <AddIcon /> Ask for Help
          </button>
        </div>
      )}
      {writingState && (
        <div className="w-full my-3 bg-dark p-3 flex flex-col gap-2 rounded-lg">
          <div className="text-semilight text-center text-sm font-normal mb-3">
            <p>
              Provide a brief description of your request and meeting schedule.
              Make sure your meeting is scheduled within the next 24 hours. A
              CityTalk post will expire after 24 hours.
            </p>
          </div>
          <div>
            <div className="text-semilight text-sm font-light">
              Meeting Link
            </div>
            <input
              type="url"
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="Paste meeting link here"
              className="h-10 bg-semidark text-semilight w-full text-base font-light rounded-lg px-2 focus:outline-none border border-semidark"
            />
          </div>
          <div>
            <div className="text-semilight text-sm font-light">Description</div>
            <textarea
              rows={2}
              className="w-full bg-semidark text-semilight text-base font-light px-2 py-1 resize-none focus:outline-none no-scrollbar rounded-lg border border-semidark"
              wrap="soft"
              maxLength={100}
              placeholder="Write description here"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 items-center">
            <button
              onClick={() => {
                setMeetLink("");
                setDescription("");
                setWritingState(false);
              }}
              className="bg-semidark text-center text-semilight w-fit px-4 font-ubuntu font-normal py-1 text-base rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={CreateCityTalkPost}
              className="bg-indigomain text-center text-semilight w-fit px-4 font-ubuntu font-normal py-1 text-base rounded-lg"
            >
              Post
            </button>
          </div>
        </div>
      )}
      {!writingState && (
        <div
          className="w-full flex flex-col items-center"
          ref={scrollContainerRef}
        >
          {cityTalksPosts.length > 0 ? (
            cityTalksPosts.map((post) => (
              <div
                key={post.id}
                className="mb-3 rounded-lg border border-semidark bg-dark w-full"
              >
                <div className="text-light my-6 px-3 font-ubuntu font-light text-base">
                  {post.description}
                  <br />
                  <a
                    href={post.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {post.meetingLink}
                  </a>
                </div>

                <div className="border-t border-semidark py-4 flex flex-col gap-4">
                  <div className="flex w-full justify-between rounded-lg items-center px-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex gap-2 items-center">
                        <img
                          src={post.user.image ? post.user.image : "/user.png"}
                          alt="Profile"
                          className="w-7 h-7 rounded-lg"
                        />
                        <div className="text-light text-sm lg:text-base font-normal">
                          {post.user.username}
                        </div>
                        <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                          · {getFormattedRemainingTime(post.expiresAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              {isLoadingCityTalksPosts ? (
                <div className="w-full my-5 flex justify-center items-center">
                  <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
                </div>
              ) : (
                <div className="text-semilight my-5 font-light text-center text-lg">
                  No posts found
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {popup && (
        <div className="text-rosemain mt-2 text-sm text-center">{popup}</div>
      )}
      <BottomBar />
    </div>
  );
};
