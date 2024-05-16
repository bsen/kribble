import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { MessagesComponent } from "../../Messages/MessagesComponent";
import { BottomBar } from "../../Bars/BottomBar";

interface User {
  id: string;
  username: string;
  image: string | null;
}

interface MatchData {
  initiatorId: string;
  initiator: User;
}

export const MatchesComponent = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [messageState, setMessageState] = useState(false);
  const [otherUser, setOtherUser] = useState<User>({
    id: "",
    username: "",
    image: null,
  });
  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);

  async function getMatchesDetails() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/matches/all/matches`,
        { token }
      );
      setLoadingState(false);
      if (response.data.data && response.data.data.length > 0) {
        const matchedUsersData = response.data.data.map(
          (match: MatchData) => match.initiator
        );
        setMatchedUsers(matchedUsersData);
      } else {
        setMatchedUsers([]);
      }
    } catch (error) {
      console.error("Error fetching matched users:", error);
    }
  }

  useEffect(() => {
    getMatchesDetails();
  }, []);

  const parentToChild = (
    username: string,
    image: string | null,
    id: string
  ) => {
    setOtherUser({ username, image, id });
  };

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <div className="flex justify-start items-center flex-col  w-full flex-1 overflow-y-auto no-scrollbar">
          {messageState ? (
            <MessagesComponent
              otherUser={{
                username: otherUser.username,
                image: otherUser.image,
                id: otherUser.id,
              }}
            />
          ) : (
            <>
              {loadingState ? (
                <div className="text-texttwo my-5  font-light text-center text-base">
                  <div>Loading ...</div>
                </div>
              ) : (
                <>
                  <div className="w-[100%] md:w-[50%] px-2">
                    {matchedUsers.length > 0 ? (
                      matchedUsers.map((user, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            parentToChild(user.username, user.image, user.id);
                            setMessageState(true);
                          }}
                          className="flex w-full border border-bordermain bg-bgmain shadow-sm rounded-xl items-center justify-between gap-4 my-2 px-4"
                        >
                          <div className="w-full m-2 flex justify-between items-center">
                            <div className="flex gap-2 justify-center items-center">
                              <img
                                src={user.image || "/user.png"}
                                alt="Profile"
                                className="h-10 w-10 bg-bgmain rounded-full"
                              />
                              <div className="flex flex-col items-start">
                                <div className="text-textmain text-sm lg:text-lg font-semibold">
                                  {user.username}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-texttwo my-5  font-light text-center text-lg">
                        No matches found
                      </div>
                    )}
                  </div>
                  <BottomBar />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
