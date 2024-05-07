import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import { MessagesComponent } from "./MessagesComponent";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
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
        `${BACKEND_URL}/api/server/v1/konnect/user-matches`,
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
                <Link to={"/konnect"}>
                  <ArrowBackIosNewRoundedIcon
                    className="text-secondarytextcolor rounded-full border  py-1 hover:bg-neutral-100"
                    sx={{ fontSize: 35 }}
                  />
                </Link>
                <div className="flex justify-center font-ubuntu text-lg font-semibold text-primarytextcolor items-center gap-2">
                  <EmailIcon
                    sx={{ fontSize: 25 }}
                    className="text-neutral-800"
                  />
                  <p>Matches</p>
                </div>
                <div></div>
              </div>

              <div className="w-full flex justify-center flex-col items-center overflow-y-auto no-scrollbar">
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
                      className="flex w-full lg:w-[80%] bg-white  border border-neutral-100 shadow-sm rounded-xl  items-center justify-between  gap-4 mt-4"
                    >
                      <div className="w-full  m-2 flex justify-between items-center">
                        <div className="flex gap-2 justify-center items-center">
                          <img
                            src={user.image || "/user.png"}
                            alt="Profile"
                            className="h-10 w-10 bg-white rounded-full"
                          />
                          <div className="flex flex-col items-start">
                            <div className="text-primarytextcolor text-sm lg:text-lg  font-semibold">
                              {user.name}
                            </div>

                            <div className="text-secondarytextcolor  text-xs font-ubuntu">
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
            </div>
          )}
        </div>
      )}
    </>
  );
};
