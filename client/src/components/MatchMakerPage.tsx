import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { BACKEND_URL } from "../config";
import { useEffect, useState } from "react";
import { LoadingPage } from "./LoadingPage";

export const MatchMakerPage = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [selectGender, setSelectGender] = useState("");
  const [matchingState, setMatchingState] = useState(false);
  const [popup, setPopup] = useState("");
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

  async function searchPeople() {
    setPopup("");
    const gender = selectGender;
    if (gender == "") {
      console.log(gender);
      return setPopup("please select a gender for matching");
    }
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/matches/users-for-match`,
        { token, gender }
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
        setPopup("No user found for matching!");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async function match() {
    setPopup("");
    const otherPersonsId = matchUserData.id;
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/matches/matchpeople`,
        { token, otherPersonsId }
      );
      setLoadingState(false);
      searchPeople();
      if (response.data.status == 400) {
        return setPopup("You already have liked thier profile");
      }
      if (response.data.status == 404) {
        return setPopup("Try again, failed for network error");
      }
      if (response.data.status == 200) {
        return setPopup("You liked their profile");
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {}, []);

  return (
    <>
      <div className="h-screen bg-black border-l border-r border-neutral-800 flex flex-col justify-between py-2">
        <div className="w-full flex justify-center">
          <div className="text-2xl flex justify-center items-center gap-5 text-white font-ubuntu text-center py-4 border-b border-neutral-800 w-[70%]">
            <div>
              {matchingState ? (
                <button
                  onClick={() => {
                    setMatchingState(false);
                  }}
                >
                  <ArrowBackIosNewRoundedIcon
                    className="text-neutral-200 rounded-full border border-neutral-700 py-1 hover:bg-neutral-800"
                    sx={{ fontSize: 35 }}
                  />
                </button>
              ) : (
                ""
              )}
            </div>
            <div>Match Maker</div>
          </div>
        </div>

        {loadingState ? (
          <LoadingPage />
        ) : (
          <div>
            {matchingState ? (
              <div>
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="w-[70%]">
                    <div className="flex gap-2 m-2 items-center">
                      <div className="text-white text-lg font-light font-ubuntu">
                        {matchUserData.name}
                      </div>
                      <div className="text-neutral-400 text-sm font-light ">
                        @{matchUserData.username}
                      </div>
                    </div>
                    <img
                      src={
                        matchUserData.image ? matchUserData.image : "user.png"
                      }
                      className="rounded-xl w-[100%]"
                    />

                    <div className="font-light text-sm text-neutral-200 m-2 w-full">
                      {matchUserData.bio}
                    </div>
                  </div>

                  <div className="flex py-2 justify-evenly w-full">
                    <div>
                      <button
                        onClick={searchPeople}
                        className="bg-black border font-ubuntu font-light border-neutral-800 text-blue-500 text-xl px-4 py-1 rounded-lg active:bg-neutral-300"
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
                        className="bg-black border font-ubuntu font-light border-neutral-800 text-pink-500 text-xl px-4 py-1 rounded-lg active:bg-neutral-300"
                      >
                        <div className="flex items-center justify-evenly">
                          <div>Date</div>
                          <FavoriteIcon className="text-pink-500" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center font-light font-ubuntu px-6 mb-10 text-xs  text-neutral-400">
                  <div className="w-full flex justify-center items-center">
                    <img src="/love.png" className=" h-12 w-12" />
                  </div>
                  <div className="text-center font-semibold font-ubuntu px-6 my-3  text-lg text-neutral-200">
                    start matching with kribble
                  </div>
                  <div className="text-neutral-300">
                    1. Your profile picture will be used for matching.
                    <br /> 2. Your bio will be shown in the matching.
                    <br /> 3. Your matches will be updated on
                    <span className="text-pink-500 text-base px-2">
                      Matches
                    </span>
                    <br />
                    section in your profile page.
                  </div>
                </div>
                <div className="text-center font-semibold font-ubuntu text-sm text-neutral-400">
                  Select the gender you want to match with
                </div>
                <div className="flex justify-center gap-5 my-5">
                  <button
                    onClick={() => {
                      setSelectGender("male");
                    }}
                    className={`bg-neutral-900  p-1   rounded-full
                    ${
                      selectGender == "male"
                        ? "text-blue-500 border border-blue-500"
                        : "text-blue-700 border border-blue-700"
                    }`}
                  >
                    <MaleIcon sx={{ fontSize: 35 }} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectGender("female");
                    }}
                    className={`bg-neutral-900  p-1 rounded-full
                    ${
                      selectGender == "female"
                        ? "text-pink-500 border border-pink-500"
                        : "text-pink-700 border border-pink-700"
                    }`}
                  >
                    <FemaleIcon sx={{ fontSize: 35 }} />
                  </button>
                </div>
                <div className="w-full flex justify-center">
                  <div>
                    <button
                      className="text-neutral-300 bg-blue-800 rounded-lg text-xl py-2 px-4 font-ubuntu  active:bg-blue-700"
                      onClick={searchPeople}
                    >
                      start matching
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="text-rose-500 font-ubuntu font-light text-center text-sm">
          {popup ? popup : ""}
        </div>
      </div>
    </>
  );
};
