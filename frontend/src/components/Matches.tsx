import GroupIcon from "@mui/icons-material/Group";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../config";
import axios from "axios";

export const Matches = () => {
  const token = localStorage.getItem("token");
  interface User {
    name: string;
    username: string;
    image: string;
  }
  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);

  async function getMatchesDetails() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/matched-dates`,
        { token }
      );
      if (response.data.status == 200) {
        setMatchedUsers(response.data.message);
      }
    } catch (error) {}
  }
  useEffect(() => {
    getMatchesDetails();
  }, []);

  return (
    <div className="flex flex-col w-[80%] items-center overflow-y-auto  h-full bg-neutral-900 mt-8 rounded-xl  border border-neutral-800">
      <div
        className={
          "p-2 w-[60%] flex  items-center justify-center gap-2 border-b border-bordercolor"
        }
      >
        <GroupIcon className={"text-pink-500"} />
        <p className={"text-pink-500"}>Matches</p>
      </div>
      {matchedUsers.length > 0 ? (
        matchedUsers
          .slice()
          .reverse()
          .map((user, index) => (
            <Link to={`/user/${user.username}`} className="w-[80%]">
              <div
                key={index}
                className="flex  bg-black/65 px-4 py-2 items-center justify-start rounded-xl mt-4 gap-3 border border-neutral-800"
              >
                <img
                  src={user.image ? user.image : "/user.png"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border border-neutral-700"
                />
                <p className="text-base font-light text-white">{user.name}</p>
              </div>
            </Link>
          ))
      ) : (
        <p className="text-center font-mono my-2 text-white">
          No matches found
        </p>
      )}
    </div>
  );
};
