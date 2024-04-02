import GroupIcon from "@mui/icons-material/Group";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config";
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
    <div className="flex flex-col w-full items-center justify-between bg-black h-screen">
      <div className="w-full flex flex-col items-center">
        <div
          className={
            "p-2 w-[70%] flex  items-center justify-center gap-2 border-b border-bordercolor"
          }
        >
          <GroupIcon className={"text-pink-500"} />
          <p className={"text-pink-500"}>Matches</p>
        </div>
        <div className="w-[60%]">
          {matchedUsers.length > 0 ? (
            matchedUsers
              .slice()
              .reverse()
              .map((user, index) => (
                <Link to={`/user/${user.username}`}>
                  <div
                    key={index}
                    className="flex bg-neutral-900 w-full py-1 items-center justify-center rounded-xl mt-4 border border-neutral-800"
                  >
                    <div className="flex gap-3 items-center justify-center">
                      <img
                        src={user.image ? user.image : "/user.png"}
                        alt="Profile"
                        className="h-10 w-10 bg-white rounded-full"
                      />
                      <p className="text-base font-semibold font-ubuntu text-white">
                        {user.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
          ) : (
            <p className="text-center font-mono my-2 text-white">
              No matches found
            </p>
          )}
        </div>
      </div>
      <div className="my-4 text-center font-thin text-xs text-neutral-500 font-ubuntu">
        © 2024 kribble Ltd
      </div>
    </div>
  );
};