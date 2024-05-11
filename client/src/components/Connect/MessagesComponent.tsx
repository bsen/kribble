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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  async function send() {
    if (sendingmessage.trim()) {
      await axios.post(`${BACKEND_URL}/api/message/send`, {
        token,
        message: sendingmessage,
        receiverId: id,
      });
      setSendingMessage("");
      getMessages();
    }
  }

  async function getMessages() {
    const response = await axios.post(`${BACKEND_URL}/api/message/get`, {
      token,
      receiverId: id,
      page: currentPage,
    });

    const newSendMessages = response.data.sendMessages
      .filter(
        (msg: Message) =>
          !sendMessages.some((oldMsg) => oldMsg.message === msg.message)
      )
      .map((msg: Message) => ({
        ...msg,
        sender: "self",
      }));

    const newReceivedMessages = response.data.receivedMessages
      .filter(
        (msg: Message) =>
          !receivedMessages.some((oldMsg) => oldMsg.message === msg.message)
      )
      .map((msg: Message) => ({
        ...msg,
        sender: "other",
      }));

    setSendMessages([...sendMessages, ...newSendMessages]);
    setReceivedMessages([...receivedMessages, ...newReceivedMessages]);
  }

  const handleScroll = () => {
    const chatContainer = chatContainerRef.current;
    if (
      chatContainer &&
      chatContainer.scrollTop === 0 &&
      (sendMessages.length + receivedMessages.length) % 20 === 0
    ) {
      setCurrentPage(currentPage + 1);
      getMessages();
    }
  };

  useEffect(() => {
    getMessages();
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
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
            className="h-16 w-16 rounded-full"
            alt={name}
          />
          <button className="invisible">
            <ArrowBackIosNewRoundedIcon
              className="text-secondarytextcolor rounded-full border  py-1 hover:bg-neutral-100"
              sx={{ fontSize: 40 }}
            />
          </button>
        </div>
        <div className="text-base font-semibold text-primarytextcolor">
          {name}
        </div>
        <div className="text-sm text-secondarytextcolor font-light">
          @{username}
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
                  ? "bg-indigo-500 text-white self-end"
                  : "bg-neutral-100 text-secondarytextcolor self-start"
              }`}
            >
              {message.message}
            </div>
          ))}
      </div>
      <div className="border-t bg-white bottom-0 border-gray-200 gap-4 w-full  lg:w-[45%] flex items-center h-16 fixed justify-center">
        <input
          type="text"
          maxLength={300}
          value={sendingmessage}
          onChange={(e) => setSendingMessage(e.target.value)}
          placeholder="Message..."
          className="w-[80%] h-10 rounded-full border border-neutral-100 px-4 bg-white focus:outline-none"
          ref={inputRef}
          onKeyDown={handleKeyDown}
        />
        <button onClick={send}>
          <SendIcon
            sx={{ fontSize: 30 }}
            className="text-neutral-800 hover:text-neutral-950 active:bg-neutral-200 p-1 rounded-full"
          />
        </button>
      </div>
    </div>
  );
};
