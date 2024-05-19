import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";

interface MatchesData {
  id: string;
  initiator: Initiator;
}

interface Initiator {
  id: string;
  username: string;
  image: string;
}

interface Message {
  message: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    image: string;
  };
}

interface MessagingUser {
  id: string;
  username: string;
  image: string;
}

export const InBoxComponent = () => {
  const token = localStorage.getItem("token");
  const [matchesData, setMatchesData] = useState<{
    initiators: MatchesData[];
    nextCursor: string | null | undefined;
  }>({
    initiators: [],
    nextCursor: undefined,
  });
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [messaging, setMessaging] = useState(false);
  const [messagingUser, setMessagingUser] = useState<MessagingUser>({
    id: "",
    username: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [showMatches, setShowMatches] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);

  async function getMatches(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/matches/all/matches`,
        { token, cursor }
      );
      setMatchesData({
        initiators: [...matchesData.initiators, ...response.data.data],
        nextCursor: response.data.nextCursor || undefined,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function getMessages() {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/message/getall`, {
        token,
        page: currentPage,
      });
      setReceivedMessages([
        ...receivedMessages,
        ...response.data.receivedMessages,
      ]);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getMatches();
    getMessages();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      (matchesData.nextCursor || receivedMessages.length % 20 === 0) &&
      !isLoading
    ) {
      setCurrentPage(currentPage + 1);
      if (matchesData.nextCursor) {
        getMatches(matchesData.nextCursor);
      }
      getMessages();
    }
  };

  const handleSendMessage = async () => {
    try {
      setErrorMessage("");
      const response = await axios.post(`${BACKEND_URL}/api/message/send`, {
        token,
        message,
        receiverId: messagingUser.id,
      });

      if (response.data.status === 400) {
        const remainingTimeInMs =
          new Date(response.data.remainingTime).getTime() - Date.now(); // Calculating the remaining time difference manually
        setRemainingTime(remainingTimeInMs);
        setErrorMessage(response.data.message);
      } else {
        setMessage("");
        setRemainingTime(0);
        getMessages();
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="h-screen bg-bgmain border-l border-r border-bordermain p-2 overflow-y-auto no-scrollbar">
      {messaging ? (
        <div className="bg-bgmain p-3 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setMessaging(false);
                setShowMatches(true);
              }}
              className="border border-bordermain p-1 rounded-full"
            >
              <ArrowBackIcon />
            </button>

            <img
              src={messagingUser.image ? messagingUser.image : "/user.png"}
              className="h-10 w-10 rounded-full"
              alt="User Avatar"
            />
            <div className="ml-2 text-lg font-semibold">
              {messagingUser.username}
            </div>
          </div>
          <div className="bg-bgtwo border border-indigomain text-indigomain px-4 py-3 rounded mb-4">
            Share a story for 24 hours. It will automatically disappear after
            that time.
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-rosemain text-rosemain px-4 py-3 rounded mb-4">
              <p>{errorMessage}</p>
              {remainingTime > 0 && (
                <p>You can send a new message in {remainingTime}</p>
              )}
            </div>
          )}
          <div className="flex items-center">
            <textarea
              cols={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your day's story..."
              maxLength={250}
              className="w-full border border-indigomain text-texttwo text-base font-light px-2 py-1 resize-none no-scrollbar rounded-lg bg-bgmain"
              disabled={remainingTime > 0}
            />
            <button
              onClick={handleSendMessage}
              className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700"
              disabled={remainingTime > 0 || !message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      ) : showMatches ? (
        <div className="h-screen absolute w-[50%] bg-white/75 flex justify-center items-center">
          <div
            className="bg-bgmain border border-bordermain shadow-md h-[50vh] rounded-lg w-72 p-2 overflow-y-auto no-scrollbar py-12 md:py-0"
            onScroll={handleScroll}
            ref={scrollContainerRef}
          >
            <div className="flex text-texttwo  justify-center gap-5 items-center py-2">
              <button
                onClick={() => {
                  setShowMatches(false);
                }}
                className="border border-bordermain p-1 rounded-full"
              >
                <ArrowBackIcon />
              </button>
              <div className="text-sm font-ubuntu text-center">Matches</div>
            </div>
            {matchesData.initiators.length > 0 ? (
              matchesData.initiators.map((initiatorObj) => (
                <div
                  onClick={() => {
                    setMessagingUser({
                      id: initiatorObj.initiator.id,
                      username: initiatorObj.initiator.username,
                      image: initiatorObj.initiator.image,
                    });
                    setMessaging(true);
                    setShowMatches(false);
                  }}
                  key={initiatorObj.id}
                  className="cursor-pointer items-center flex justify-between my-2 rounded-md border border-bordermain px-2 py-1 bg-bordermain"
                >
                  <div className="flex justify-start items-center gap-2">
                    <img
                      className="h-9 w-9 rounded-full"
                      src={
                        initiatorObj.initiator.image
                          ? initiatorObj.initiator.image
                          : "/user.png"
                      }
                    />
                    <div>
                      <div className="text-textmain text-lg font-ubuntu">
                        {initiatorObj.initiator.username}
                      </div>
                    </div>
                  </div>
                  <MailOutlinedIcon className="texttwo" />
                </div>
              ))
            ) : (
              <div className="text-texttwo my-5  font-light text-center text-sm">
                No Matches found
              </div>
            )}
            {isLoading && (
              <div className="text-texttwo my-5  font-light text-center text-sm">
                Loading ...
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center px-2">
            <button
              onClick={() => {
                setShowMatches(true);
              }}
              className="text-xs text-bgmain font-light bg-indigomain px-3 py-1 rounded-full"
            >
              Check new matches
            </button>
            <div className="text-sm font-ubuntu text-center">Inbox</div>
          </div>
          <div
            className="overflow-y-auto no-scrollbar"
            onScroll={handleScroll}
            ref={scrollContainerRef}
          >
            {receivedMessages.length > 0 ? (
              receivedMessages.map((message, index) => (
                <div
                  key={index}
                  className="mt-2 max-w-[70%] rounded-lg px-4 py-1 bg-bordermain text-textmain self-start"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        message.sender.image
                          ? message.sender.image
                          : "/user.png"
                      }
                      className="h-9 w-9 rounded-full"
                    />
                    <div>
                      <div className="text-textmain text-sm font-semibold">
                        {message.sender.username}
                      </div>
                      <div className="text-textmain text-sm">
                        {message.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-texttwo my-5  font-light text-center text-sm">
                No Messages found
              </div>
            )}
            {isLoading && (
              <div className="text-texttwo my-5  font-light text-center text-sm">
                Loading ...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
