import GroupIcon from "@mui/icons-material/Group";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import { Messages } from "./Messages";

export const Matches = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [messageState, setMessageState] = useState(false);
  const [otherUser, setOtherUser] = useState<User>({
    username: "",
    name: "",
    image: "",
    id: "",
  });

  interface User {
    id: string;
    name: string;
    username: string;
    image: string;
  }

  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);

  async function getMatchesDetails() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/matched-dates`,
        { token }
      );
      setLoadingState(false);
      if (response.data.status === 200) {
        setMatchedUsers(response.data.message);
      }
    } catch (error) {}
  }

  useEffect(() => {
    getMatchesDetails();
  }, []);

  const parentToChild = (
    username: string,
    name: string,
    image: string,
    id: string
  ) => {
    setOtherUser({ username, name, image, id });
  };

  return (
    <>
      {messageState ? (
        <Messages
          otherUser={{
            username: otherUser.username,
            name: otherUser.name,
            image: otherUser.image,
            id: otherUser.id,
          }}
        />
      ) : (
        <div className="w-full">
          {loadingState ? (
            <div className="text-center font-ubuntu my-5 text-primarytextcolor">
              Loading ...
            </div>
          ) : (
            <div className=" bg-gre flex flex-col items-center p-5">
              <div
                className={
                  "p-2 flex  items-center text-center w-full justify-center gap-2 "
                }
              >
                <GroupIcon className={"text-blue-600"} />
                <p className={"text-blue-600"}>Matches</p>
              </div>

              {matchedUsers.length > 0 ? (
                matchedUsers
                  .slice()
                  .reverse()
                  .map((user, index) => (
                    <div
                      key={index}
                      className="flex bg-white border border-neutral-100 shadow-sm rounded-xl py-2 px-4 items-center justify-start  gap-4 mt-4"
                    >
                      <div className="flex px-2 gap-3 items-center justify-center">
                        <img
                          src={user.image ? user.image : "/user.png"}
                          alt="Profile"
                          className="h-8 w-8 bg-background rounded-full"
                        />
                        <Link
                          to={`/${user.username}`}
                          key={user.username}
                          className="flex gap-2 justify-between items-center"
                        >
                          <div className="text-primarytextcolor text-lg font-semibold">
                            {user.name}
                          </div>

                          <div className="text-secondarytextcolor  text-xs font-ubuntu">
                            @{user.username}
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            parentToChild(
                              user.username,
                              user.name,
                              user.image,
                              user.id
                            );
                            setMessageState(true);
                          }}
                        >
                          <EmailIcon
                            sx={{ fontSize: 30 }}
                            className="text-blue-600 hover:text-blue-500"
                          />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center w-full font-mono my-2 text-primarytextcolor">
                  No matches found
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
