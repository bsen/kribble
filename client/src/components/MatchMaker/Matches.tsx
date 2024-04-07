import GroupIcon from "@mui/icons-material/Group";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import axios from "axios";

export const Matches = () => {
  const navigate = useNavigate();
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
    <div className="w-[80%] flex flex-col items-start p-5">
      <div
        className={
          "p-2 flex  items-center text-center w-full justify-center gap-2 "
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
            <Link
              to={`/${user.username}`}
              className="w-full"
              key={user.username}
            >
              <div
                key={index}
                className="flex w-full py-2 px-4 items-center justify-start  gap-4 rounded-xl mt-4 border border-neutral-200"
              >
                <div className="flex gap-3 items-center justify-center">
                  <img
                    src={user.image ? user.image : "/user.png"}
                    alt="Profile"
                    className="h-8 w-8 bg-background rounded-full"
                  />

                  <div className="text-primarytextcolor text-base font-semibold">
                    {user.name}
                  </div>

                  <div className="text-secondarytextcolor text-xs font-ubuntu">
                    @{user.username}
                  </div>
                </div>
              </div>
            </Link>
          ))
      ) : (
        <p className="text-center w-full font-mono my-2 text-primarytextcolor">
          No matches found
        </p>
      )}
    </div>
  );
};
