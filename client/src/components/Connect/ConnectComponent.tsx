import axios from "axios";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { BACKEND_URL } from "../../config";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { BottomBar } from "../Bars/BottomBar";
import { NavBar } from "../Bars/NavBar";

export const ConnectComponent = () => {
  const token = localStorage.getItem("token");

  const [loadingState, setLoadingState] = useState(false);
  const [selectGender, setSelectGender] = useState("");
  const [matchingState, setMatchingState] = useState(false);
  const [popup, setPopup] = useState("");

  const [matchUserData, setMatchUserData] = useState<{
    id: string;
    username: string;
    bio: string;
    interest: string;
    image: string;
  }>({
    id: "",
    username: "",
    bio: "",
    interest: "",
    image: "",
  });

  async function searchPeople() {
    setPopup("");
    const gender = selectGender;
    if (gender == "") {
      console.log(gender);
      return setPopup("Please select a gender for connecting");
    }
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/connect/users-for-match`,
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
        `${BACKEND_URL}/api/server/v1/connect/match-people`,
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
      <NavBar />
      <div className="bg-white border-l border-r border-neutral-100 h-screen flex flex-col justify-center items-center">
        <div className="w-full mb-5 flex justify-center py-2">
          <div className="text-2xl flex justify-center items-center gap-5 text-primarytextcolor font-ubuntu text-center">
            {matchingState && !loadingState ? (
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => {
                    setMatchingState(false);
                  }}
                >
                  <ArrowBackIosNewRoundedIcon
                    className="text-primarytextcolor rounded-full border py-1 hover:bg-neutral-100"
                    sx={{ fontSize: 35 }}
                  />
                </button>
                <div>connect</div>
              </div>
            ) : (
              "‎"
            )}
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          {loadingState ? (
            <div className="my-5 bg-white flex justify-center items-center w-full">
              <CircularProgress color="inherit" />
            </div>
          ) : (
            <div className="flex w-full px-5 text-center flex-col items-center justify-center">
              {matchingState ? (
                <div className="w-full flex flex-col justify-center items-center gap-2">
                  <img
                    src={matchUserData.image ? matchUserData.image : "user.png"}
                    className="rounded-xl max-w-[40%] border border-neutral-100 p-2"
                  />
                  <div>
                    <div className="text-primarytextcolor text-base font-medium font-ubuntu">
                      {matchUserData.username}
                    </div>
                  </div>
                  <div className="font-light text-sm text-secondarytextcolor m-2 w-[50%]">
                    {matchUserData.interest
                      ? "interest · " + matchUserData.interest
                      : ""}
                    <br />
                    {matchUserData.bio ? "bio · " + matchUserData.bio : ""}
                  </div>
                  <div className="flex items-center py-2 justify-center gap-5 w-full">
                    <button
                      onClick={searchPeople}
                      className="bg-neutral-800 w-[15%] font-ubuntu font-normal text-base py-2 rounded-full active:bg-neutral-700 flex items-center text-white justify-evenly"
                    >
                      <div>Pass</div>
                    </button>
                    <button
                      onClick={match}
                      className=" bg-indigo-600 w-[15%] font-ubuntu font-normal text-base py-2 rounded-full active:bg-indigo-500 flex text-white items-center justify-evenly"
                    >
                      <div>Connect</div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5 items-center">
                  <div className="text-center font-light font-ubuntu px-6 text-xs text-secondarytextcolor">
                    <div className="w-full flex justify-center items-center">
                      <img
                        src="/match.png"
                        className="h-20 w-20 mb-5"
                        alt="Match"
                      />
                    </div>
                    <div className="text-center font-semibold font-ubuntu px-6 my-3 text-xl text-primarytextcolor">
                      Start Connecting with kribble
                    </div>
                    <div className="text-secondarytextcolor font-normal text-sm">
                      1. Your profile picture, bio and interest will be used for
                      connecting.
                      <br />
                      2. You can only exchange messages with people you've been
                      matched with.
                    </div>
                  </div>
                  <div className="flex justify-center gap-5 my-5">
                    <button
                      onClick={() => {
                        setSelectGender("male");
                      }}
                      className={`p-1 rounded-full ${
                        selectGender == "male"
                          ? "text-indigo-500 border border-indigo-500 bg-indigo-100"
                          : "text-indigo-500 border border-indigo-500"
                      }`}
                    >
                      <MaleIcon sx={{ fontSize: 35 }} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectGender("female");
                      }}
                      className={`p-1 rounded-full ${
                        selectGender == "female"
                          ? "text-pink-500 border border-pink-500 bg-pink-100"
                          : "text-pink-600 border border-pink-600"
                      }`}
                    >
                      <FemaleIcon sx={{ fontSize: 35 }} />
                    </button>
                  </div>
                  <div className="w-full text-white gap-5 flex items-center flex-col justify-center">
                    <button
                      className="text-background rounded-md bg-indigo-500 text-base py-2 px-4 font-ubuntu active:bg-indigo-800"
                      onClick={searchPeople}
                    >
                      Start Connecting
                    </button>
                    <Link
                      className="text-background rounded-md bg-neutral-800 text-base py-2 px-4 font-ubuntu active:bg-neutral-800"
                      to={"/matches"}
                    >
                      Browse Matches
                    </Link>
                  </div>
                  <div className="text-rose-500 my-5 font-ubuntu font-light text-center text-sm">
                    {popup ? popup : <div>‎</div>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <BottomBar />
      </div>
    </>
  );
};
