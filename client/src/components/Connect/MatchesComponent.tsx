import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
import axios from "axios";
import { MessagesComponent } from "../Messages/MessagesComponent";
import { BottomBar } from "../Bars/BottomBar";

interface User {
  id: string;
  name: string;
  username: string;
  image: string;
}

export const MatchesComponent = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [messageState, setMessageState] = useState(false);
  const [otherUser, setOtherUser] = useState<User>({
    id: "",
    name: "",
    username: "",
    image: "",
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
          (item: { userTwo: User }) => item.userTwo
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
  console.log(matchedUsers);
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
      <div className="w-full h-screen flex flex-col">
        <div className="flex justify-start items-center flex-col  w-full flex-1 overflow-y-auto no-scrollbar">
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
            <>
              {loadingState ? (
                <div className="text-center font-ubuntu py-4 text-primarytextcolor">
                  <div>Loading ...</div>
                </div>
              ) : (
                <>
                  <div className="my-4 bg-white px-4 py-1 text-lg font-light rounded-md">
                    Matches
                  </div>
                  <div className="w-full px-2">
                    {matchedUsers.length > 0 ? (
                      matchedUsers.map((user, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            parentToChild(
                              user.username,
                              user.name,
                              user.image || "/user.png",
                              user.id
                            );
                            setMessageState(true);
                          }}
                          className="flex w-full  bg-white border border-neutral-100 shadow-sm rounded-xl items-center justify-between gap-4 my-2 px-4"
                        >
                          <div className="w-full m-2 flex justify-between items-center">
                            <div className="flex gap-2 justify-center items-center">
                              <img
                                src={user.image || "/user.png"}
                                alt="Profile"
                                className="h-10 w-10 bg-white rounded-full"
                              />
                              <div className="flex flex-col items-start">
                                <div className="text-primarytextcolor text-sm lg:text-lg font-semibold">
                                  {user.name}
                                </div>
                                <div className="text-secondarytextcolor text-xs font-ubuntu">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center w-full font-mono my-2 text-primarytextcolor">
                        No matches found
                      </p>
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
