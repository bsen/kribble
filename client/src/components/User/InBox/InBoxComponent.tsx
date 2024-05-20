import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
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
                setShowMatches(false);
              }}
              className="border border-bordermain p-1 rounded-lg"
            >
              <ArrowBackIcon className="text-texttwo" />
            </button>

            <img
              src={messagingUser.image ? messagingUser.image : "/user.png"}
              className="h-10 w-10 rounded-lg"
              alt="User Avatar"
            />
            <div className="ml-2 text-lg text-textmain font-normal">
              {messagingUser.username}
            </div>
          </div>
          <div className="bg-indigomain text-sm border-indigomain text-texttwo px-4 py-2 rounded mb-4">
            Share a story for 24 hours. It will automatically disappear after
            that duration. Please note that sent messages cannot be viewed or
            deleted.
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-rosemain text-rosemain px-4 py-3 rounded mb-4">
              <p>{errorMessage}</p>
              {remainingTime > 0 && (
                <p>You can send a new message in {remainingTime}</p>
              )}
            </div>
          )}
          <div className="flex items-end">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your day's story..."
              maxLength={500}
              className="w-full  bg-bordermain text-texttwo text-base font-light px-2 py-1 resize-none no-scrollbar focus:outline-none rounded-lg"
              disabled={remainingTime > 0}
            />
          </div>
          <div className="w-full my-4 flex justify-end">
            <button
              onClick={handleSendMessage}
              className="cursor-pointer px-4 py-1 bg-indigo-600 text-texttwo rounded-lg hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700"
              disabled={remainingTime > 0 || !message.trim()}
            >
              <ScheduleSendOutlinedIcon sx={{ fontSize: 25 }} />
            </button>{" "}
          </div>
        </div>
      ) : showMatches ? (
        <div className="h-screen  flex justify-center items-center">
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
                className="border border-bordermain p-1 rounded-lg"
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
                  className="cursor-pointer items-center flex justify-between my-2 rounded-lg border border-bordermain px-2 py-1 bg-bordermain"
                >
                  <div className="flex justify-start items-center gap-2">
                    <img
                      className="h-9 w-9 rounded-lg"
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
                  <MailOutlinedIcon className="text-texttwo" />
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
            <div className="p-2 mb-2 flex justify-between items-center w-full">
              <div className="text-base flex items-center gap-2 text-texttwo font-ubuntu text-center">
                <ScheduleOutlinedIcon /> 24 Hour Inbox
              </div>
              <button
                onClick={() => {
                  setShowMatches(true);
                }}
                className="text-sm text-texttwo font-light bg-indigomain px-3 py-1 rounded-lg"
              >
                Matches
              </button>
            </div>
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
                  className="mt-2 shadow-sm w-full rounded-lg p-3 bg-bgmain border border-bordermain text-textmain self-start"
                >
                  <div className="flex items-start  gap-2">
                    <img
                      src={
                        message.sender.image
                          ? message.sender.image
                          : "/user.png"
                      }
                      className="h-9 w-9 rounded-lg"
                    />
                    <div className="w-full">
                      <div className="w-full flex justify-between items-center">
                        <div className="text-textmain text-lg">
                          {message.sender.username}
                        </div>
                        <button
                          onClick={() => {
                            setMessagingUser({
                              id: message.sender.id,
                              username: message.sender.username,
                              image: message.sender.image,
                            });
                            setMessaging(true);
                            setShowMatches(false);
                          }}
                        >
                          <ReplyOutlinedIcon
                            sx={{ fontSize: 20 }}
                            className="text-texttwo"
                          />
                        </button>
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
