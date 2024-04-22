import GroupIcon from "@mui/icons-material/Group";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import { MessagesComponent } from "./MessagesComponent";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

export const MatchesComponent = () => {
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
        <MessagesComponent
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
            <div className="flex flex-col items-center p-5">
              <div
                className={
                  "p-2 flex justify-evenly items-center text-center w-full"
                }
              >
                <Link to={"/kribconnect"}>
                  <ArrowBackIosNewRoundedIcon
                    className="text-secondarytextcolor rounded-full border  py-1 hover:bg-neutral-100"
                    sx={{ fontSize: 35 }}
                  />
                </Link>
                <div className="flex justify-center items-center gap-2">
                  <GroupIcon className={"text-blue-500"} />
                  <p className={"text-blue-500"}>Matches</p>
                </div>
                <div></div>
              </div>
              <div className="w-full flex justify-center flex-col items-center overflow-y-auto no-scrollbar">
                {matchedUsers.length > 0 ? (
                  matchedUsers
                    .slice()
                    .reverse()
                    .map((user, index) => (
                      <div
                        key={index}
                        className="flex w-[80%] bg-white  border border-neutral-100 shadow-sm rounded-xl py-2 px-4 items-center justify-between  gap-4 mt-4"
                      >
                        <div className="flex gap-2 justify-center items-center">
                          <img
                            src={user.image ? user.image : "/user.png"}
                            alt="Profile"
                            className="h-10 w-10 bg-background rounded-full"
                          />
                          <Link to={`/${user.username}`} key={user.username}>
                            <div className="text-primarytextcolor text-lg font-semibold">
                              {user.name}
                            </div>
                          </Link>
                          <div className="text-secondarytextcolor  text-xs font-ubuntu">
                            @{user.username}
                          </div>
                        </div>

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
                            className="text-blue-500 hover:text-blue-500"
                          />
                        </button>
                      </div>
                    ))
                ) : (
                  <p className="text-center w-full font-mono my-2 text-primarytextcolor">
                    No matches found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
