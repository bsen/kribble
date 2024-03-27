import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { BACKEND_URL } from "../config";

import { useState } from "react";

export const Matches = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);

  const [matchingState, setMatchingState] = useState(false);
  const [matchUserData, setMatchUserData] = useState<{
    id: string;
    name: string;
    username: string;
    bio: string;
    image: string;
  }>({
    id: "",
    name: "",
    username: "",
    bio: "",
    image: "",
  });

  async function getMatchPeoples() {
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/matches/users-for-match`,
        { token }
      );

      if (
        Array.isArray(response.data.message) &&
        response.data.message.length > 0
      ) {
        setMatchUserData(response.data.message[0]);
        setMatchingState(true);
        setLoadingState(false);
      } else {
        setMatchingState(false);
        setLoadingState(false);
        alert("No user found for matching!");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async function match() {
    const otherPersonsId = matchUserData.id;
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/matches/matchpeople`,
        { token, otherPersonsId }
      );
      setLoadingState(false);
      getMatchPeoples();
      if (response.data.status == 400) {
        return alert("You already have liked thier profile");
      }
      if (response.data.status == 404) {
        return alert("Try again, failed for network error");
      }
      if (response.data.status == 200) {
        return alert("You liked their profile");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="h-screen bg-black border-l border-bordercolor flex flex-col justify-between">
        <div className="w-full flex justify-center">
          <div className="text-2xl  text-white font-mono w-[70%] text-center py-4 border-b border-bordercolor">
            Vit Dates
          </div>
        </div>

        {loadingState ? (
          <div className="h-full flex justify-center items-center">
            <CircularProgress />
          </div>
        ) : (
          <div>
            {matchingState ? (
              <div className="w-full flex flex-col items-center justify-center ">
                <div className="w-[80%]">
                  <div className="flex gap-2 m-2 items-center">
                    <p className="text-white text-lg font-light font-mono">
                      {matchUserData.name}
                    </p>
                    <p className="text-neutral-400 text-sm font-light ">
                      @{matchUserData.username}
                    </p>
                  </div>
                  <img
                    src={matchUserData.image ? matchUserData.image : "user.png"}
                    className="rounded-xl w-[100%]"
                  />

                  <p className="font-light text-sm text-neutral-200 m-2 w-full">
                    {matchUserData.bio}
                  </p>
                </div>

                <div className="flex py-2 justify-evenly w-full">
                  <div>
                    <button
                      onClick={getMatchPeoples}
                      className="bg-white border font-mono font-light border-bordercolor text-blue-500 text-xl px-4 py-1 rounded-lg active:bg-neutral-300"
                    >
                      <div className="flex items-center justify-evenly">
                        <div>Pass</div>
                        <CloseIcon className="text-blue-500" />
                      </div>
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={match}
                      className="bg-white border font-mono font-light border-bordercolor text-pink-500 text-xl px-4 py-1 rounded-lg active:bg-neutral-300"
                    >
                      <div className="flex items-center justify-evenly">
                        <div>Date</div>
                        <FavoriteIcon className="text-pink-500" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-full flex justify-center items-center">
                  <img src="/love.png" className=" h-12 w-12" />
                </div>

                <div className="text-center font-extralight px-6 my-3  text-lg font-sans text-neutral-200">
                  Find dates in your campus, start matching with undate
                </div>
                <div className="text-center font-extralight px-6 my-3 text-xs font-sans text-neutral-200">
                  1. Your profile picture will be used for matching.
                  <br /> 2. Your bio will be shown in the matching.
                  <br /> 3. Your matches will be updated on
                  <span className="text-pink-500"> Matches </span>
                  section.
                </div>

                <div className="w-full flex justify-center my-10">
                  <div className="text-white bg-blue-600 rounded-lg text-xl py-2 px-4 font-mono  active:bg-blue-700">
                    <button onClick={getMatchPeoples}>start matching</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          <p className="my-4 text-center font-thin text-xs text-bordercolor font-mono">
            © 2024 undate Ltd <br /> a biswarup sen production
          </p>
        </div>
      </div>
    </>
  );
};
