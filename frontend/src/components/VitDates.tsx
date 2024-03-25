import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { BACKEND_URL } from "../config";

import { useState } from "react";

export const VitDates = () => {
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
        `${BACKEND_URL}/api/server/v1/user/send-people-for-match`,
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
        `${BACKEND_URL}/api/server/v1/user/match_people`,
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
      {loadingState ? (
        <div className="h-screen bg-black border-l border-bordercolor flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="h-screen bg-black border-l border-bordercolor flex flex-col justify-between">
          <div className="w-full flex justify-center">
            <div className="text-3xl  text-white font-mono w-[80%] text-center py-5 border-b border-bordercolor">
              Vit Dates
            </div>
          </div>

          {matchingState ? (
            <div className="w-full flex flex-col items-center justify-center ">
              <div className="w-[80%]">
                <div className="flex gap-2 m-2 items-center">
                  <p className="text-white text-lg font-light font-mono">
                    {matchUserData.name}
                  </p>
                  <p className="text-gray-400 text-sm font-light ">
                    @{matchUserData.username}
                  </p>
                </div>
                <img
                  src={matchUserData.image ? matchUserData.image : "user.png"}
                  className="rounded-xl w-[100%]"
                />

                <p className="font-light text-sm text-gray-200 m-2 w-full">
                  {matchUserData.bio}
                </p>
              </div>

              <div className="flex py-2 justify-evenly w-full">
                <div>
                  <button
                    onClick={getMatchPeoples}
                    className="bg-white border font-mono font-light border-bordercolor text-indigo-500 text-xl px-4 py-1 rounded-lg active:bg-neutral-900"
                  >
                    <div className="flex items-center justify-evenly">
                      <div>Pass</div>
                      <CloseIcon className="text-inidgo-500" />
                    </div>
                  </button>
                </div>
                <div>
                  <button
                    onClick={match}
                    className="bg-white border font-mono font-light border-bordercolor text-pink-500 text-xl px-4 py-1 rounded-lg active:bg-neutral-900"
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

              <div className="text-center font-extralight px-6 my-3  text-lg font-sans text-gray-200">
                Find dates in your campus, start matching with undate
              </div>
              <div className="text-center font-extralight px-6 my-3 text-xs font-sans text-gray-200">
                1. Your profile picture will be used for matching.
                <br /> 2. Your bio will be shown in the matching.
                <br /> 3. Once get a match it will be updated in match dates
                section.
              </div>

              <div className="w-full flex justify-center my-10">
                <div className="text-white bg-black rounded-lg text-xl py-1 px-3 font-mono  border border-bordercolor active:bg-neutral-900">
                  <button onClick={getMatchPeoples}>start matching</button>
                </div>
              </div>
            </div>
          )}

          <p className="my-4 text-center font-mono font-thin text-xs text-bordercolor">
            © 2024 undate Ltd / biswarup sen production
          </p>
        </div>
      )}
    </>
  );
};
