import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { BACKEND_URL } from "../../config";
import { useEffect, useState } from "react";
import { BottomButtons } from "../Mobile/BottomButtons";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";

export const KribConectComponent = () => {
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
    interest: string;
    image: string;
  }>({
    id: "",
    name: "",
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
      <div className="h-screen  py-2 ">
        <div className="w-full flex justify-center py-2">
          <div className="text-2xl flex justify-center items-center gap-5 text-primarytextcolor font-ubuntu text-center">
            <div>
              {matchingState ? (
                <button
                  onClick={() => {
                    setMatchingState(false);
                  }}
                >
                  <ArrowBackIosNewRoundedIcon
                    className="text-primarytextcolor rounded-full border  py-1 hover:bg-neutral-100"
                    sx={{ fontSize: 35 }}
                  />
                </button>
              ) : (
                ""
              )}
            </div>
            <div>KribConnect</div>
          </div>
        </div>
        <div>
          {loadingState ? (
            <div className="h-[80vh] bg-background flex justify-center items-center w-full">
              <CircularProgress />
            </div>
          ) : (
            <div className="h-[80vh] flex flex-col items-center justify-center">
              {matchingState ? (
                <div>
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="w-[70%]">
                      <div className="flex gap-2 m-2 items-center">
                        <div className="text-primarytextcolor text-lg font-light font-ubuntu">
                          {matchUserData.name}
                        </div>
                        <div className="text-secondarytextcolor text-sm font-light ">
                          @{matchUserData.username}
                        </div>
                      </div>
                      <img
                        src={
                          matchUserData.image ? matchUserData.image : "user.png"
                        }
                        className="rounded-xl w-[100%]"
                      />

                      <div className="font-light text-sm text-secondarytextcolor m-2 w-full">
                        {matchUserData.bio ? "bio · " + matchUserData.bio : ""}
                        <br />
                        {matchUserData.interest
                          ? "interest · " + matchUserData.interest
                          : ""}
                      </div>
                    </div>

                    <div className="flex py-2 justify-evenly w-full">
                      <div>
                        <button
                          onClick={searchPeople}
                          className="bg-blue-500 font-ubuntu font-medium shadow-md text-white text-xl px-4 py-1 rounded-lg active:bg-blue-500"
                        >
                          <div className="flex items-center justify-evenly">
                            <div>Pass</div>
                            <CloseIcon />
                          </div>
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={match}
                          className="bg-blue-500 font-ubuntu font-medium shadow-md text-white text-xl px-4 py-1 rounded-lg active:bg-blue-500"
                        >
                          <div className="flex items-center justify-evenly">
                            <div>Connect</div>
                            <DoneIcon />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center font-light font-ubuntu px-6  text-xs  text-secondarytextcolor">
                    <div className="w-full flex justify-center items-center">
                      <PeopleAltIcon
                        sx={{ fontSize: 60 }}
                        className="text-blue-500 p-1 rounded-full"
                      />
                    </div>
                    <div className="text-center font-semibold font-ubuntu px-6 my-3  text-lg text-primarytextcolor">
                      Start Connecting with Kribble{" "}
                    </div>
                    <div className="text-secondarytextcolor">
                      Your profile picture, bio and interest will be used for
                      connecting.
                    </div>
                  </div>

                  <div className="flex justify-center gap-5 my-5">
                    <button
                      onClick={() => {
                        setSelectGender("male");
                      }}
                      className={`p-1 rounded-full
                    ${
                      selectGender == "male"
                        ? "text-blue-500 border border-blue-500 bg-blue-100"
                        : "text-blue-500 border border-blue-500"
                    }`}
                    >
                      <MaleIcon sx={{ fontSize: 35 }} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectGender("female");
                      }}
                      className={`p-1 rounded-full
                    ${
                      selectGender == "female"
                        ? "text-pink-500 border border-pink-500 bg-pink-100"
                        : "text-pink-600 border border-pink-600"
                    }`}
                    >
                      <FemaleIcon sx={{ fontSize: 35 }} />
                    </button>
                  </div>
                  <div className="w-full gap-5 flex items-center flex-col justify-center">
                    <button
                      className="text-background  w-[60%] bg-blue-500 rounded-lg text-xl py-2 px-4 font-ubuntu  active:bg-blue-800"
                      onClick={searchPeople}
                    >
                      Start Connecting
                    </button>

                    <Link
                      className="text-background w-[60%] text-center bg-neutral-800 rounded-lg text-xl py-2 px-4 font-ubuntu  active:bg-blue-800"
                      to={"/matches"}
                    >
                      Browse matches
                    </Link>
                  </div>
                  <div className="text-rose-500 my-5 font-ubuntu font-light text-center text-sm">
                    {popup ? popup : ""}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <BottomButtons />
      </div>
    </>
  );
};
