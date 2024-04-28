import axios from "axios";
import { useEffect, useState, useRef } from "react";
import SendIcon from "@mui/icons-material/Send";
import { BACKEND_URL } from "../../config";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

interface User {
  name: string;
  username: string;
  image: string;
  id: string;
}

interface Message {
  message: string;
  createdAt: string;
  sender?: "self" | "other";
}

export const MessagesComponent: React.FC<{ otherUser: User }> = (props) => {
  const token = localStorage.getItem("token");
  const { username, name, image, id } = props.otherUser;
  const [sendingmessage, setSendingMessage] = useState("");
  const [sendMessages, setSendMessages] = useState<Message[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [popUp, setPopUp] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  async function send() {
    if (sendMessages.length == 10) {
      return setPopUp(true);
    }
    if (sendingmessage.trim()) {
      await axios.post(`${BACKEND_URL}/api/server/v1/matches/send-message`, {
        token,
        message: sendingmessage,
        receiverId: id,
      });
      setSendingMessage("");
      getMessages();
      checkMessages();
    }
  }

  async function getMessages() {
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/matches/get-messages`,
      {
        token,
        receiverId: id,
      }
    );
    setSendMessages(
      response.data.sendMessages.map((msg: Message) => ({
        ...msg,
        sender: "self",
      }))
    );
    setReceivedMessages(
      response.data.receivedMessages.map((msg: Message) => ({
        ...msg,
        sender: "other",
      }))
    );
  }

  function checkMessages() {
    setPopUp(false);
    if (sendMessages.length == 10) {
      setPopUp(true);
    }
  }
  useEffect(() => {
    getMessages();
    checkMessages();
  }, []);
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [sendMessages, receivedMessages]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col  justify-between">
      <div className="flex shadow-sm p-2 w-full flex-col justify-center items-center">
        <div className="flex justify-around w-full">
          <button
            onClick={() => {
              window.location.reload();
            }}
          >
            <ArrowBackIosNewRoundedIcon
              className="text-secondarytextcolor rounded-full border  py-1 hover:bg-neutral-100"
              sx={{ fontSize: 40 }}
            />
          </button>
          <img
            src={image ? image : "/user.pmg"}
            className="h-20 w-20 rounded-full"
            alt={name}
          />
          <button className="invisible">
            <ArrowBackIosNewRoundedIcon
              className="text-secondarytextcolor rounded-full border  py-1 hover:bg-neutral-100"
              sx={{ fontSize: 40 }}
            />
          </button>
        </div>
        <div className="text-xl font-semibold text-primarytextcolor">
          {name}
        </div>
        <div className="text-sm text-secondarytextcolor font-light">
          @{username}
        </div>
        <div className="text-sm text-center text-secondarytextcolor font-ubuntu">
          Congratulations you have a match with {name} <br />
          {popUp ? (
            <div className="text-rose-500">You can't send more messages</div>
          ) : (
            <div> You can send {10 - sendMessages.length} messages</div>
          )}
        </div>
      </div>
      <div
        className="flex-grow mb-16 overflow-y-auto flex flex-col p-4 no-scrollbar"
        ref={chatContainerRef}
      >
        {[...receivedMessages, ...sendMessages]
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .map((message, index) => (
            <div
              key={index}
              className={`mt-2 max-w-[70%] rounded-lg px-3 py-2 ${
                message.sender === "self"
                  ? "bg-blue-500 text-white self-end"
                  : "bg-neutral-100 text-secondarytextcolor self-start"
              }`}
            >
              {message.message}
            </div>
          ))}
      </div>
      <div className="border-t bg-white bottom-16 lg:bottom-0 border-gray-200 gap-4 w-full  lg:w-[45%] flex items-center h-16 fixed justify-center">
        <input
          type="text"
          maxLength={300}
          value={sendingmessage}
          onChange={(e) => setSendingMessage(e.target.value)}
          placeholder="Message..."
          className="w-[80%] h-10 rounded-full border border-neutral-100 px-4 bg-neutral-50 focus:outline-none"
          ref={inputRef}
          onKeyDown={handleKeyDown}
        />
        <button onClick={send}>
          <SendIcon
            sx={{ fontSize: 30 }}
            className="text-blue-500 hover:text-blue-700 active:bg-neutral-200 p-1 rounded-full"
          />
        </button>
      </div>
    </div>
  );
};
