import axios from "axios";
import { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { BACKEND_URL } from "../../config";
interface User {
  name: string;
  username: string;
  image: string;
  id: string;
}

export const Messages: React.FC<{ otherUser: User }> = (props) => {
  const token = localStorage.getItem("token");
  const { username, name, image, id } = props.otherUser;
  const [message, setMessage] = useState("");
  async function send() {
    await axios.post(`${BACKEND_URL}/api/server/v1/user/message`, {
      token,
      message,
      receiverId: id,
    });
  }
  return (
    <div className="h-[90vh] w-full overflow-y-auto no-scrollbar">
      <div className="flex shadow-sm p-2 w-full flex-col justify-center items-center">
        <img
          src={image ? image : "/user.pmg"}
          className="h-20 w-20  rounded-full"
        />
        <div className="text-xl font-semibold text-primarytextcolor">
          {name}
        </div>
        <div className="text-sm text-secondarytextcolor font-light">
          @{username}
        </div>
        <div className="text-sm text-center text-secondarytextcolor font-ubuntu">
          Congratulations you have a match with {name}
          <br /> You can send her 10 messages
        </div>
      </div>

      <div className="fixed bottom-0 border-t border-gray-200 gap-4 w-[45%] h-20 flex items-center justify-center">
        <input
          type="text"
          maxLength={300}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
          className=" w-[80%] h-10 rounded-full border border-neutral-100 px-4 bg-neutral-50 focus:outline-none"
        />
        <button onClick={send}>
          <SendIcon className="text-blue-600" />
        </button>
      </div>
    </div>
  );
};
