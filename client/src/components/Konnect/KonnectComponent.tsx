import axios from "axios";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { BACKEND_URL } from "../../config";
import { useEffect, useState } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { SearchBox } from "../HomeComponents/SearchBar";

export const KonnectComponent = () => {
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
        `${BACKEND_URL}/api/server/v1/konnect/users-for-match`,
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
        `${BACKEND_URL}/api/server/v1/konnect/match-people`,
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
      <div className=" pt-16">
        <SearchBox />
        <div className="w-full mb-5 flex justify-center py-2">
          <div className="text-2xl flex justify-center items-center gap-5 text-primarytextcolor font-ubuntu text-center">
            <div>
              {matchingState && !loadingState ? (
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
                "‎"
              )}
            </div>
            <div>Konnect</div>
          </div>
        </div>
        <div>
          {loadingState ? (
            <div className="my-10 bg-background flex justify-center items-center w-full">
              <CircularProgress />
            </div>
          ) : (
            <div className=" flex flex-col items-center justify-center">
              {matchingState ? (
                <div>
                  <div className=" flex flex-col items-center justify-evenly">
                    <div className="w-[80%] lg:w-[60%] flex flex-col gap-2">
                      <img
                        src={
                          matchUserData.image ? matchUserData.image : "user.png"
                        }
                        className="rounded-xl w-[100%] border border-neutral-100 p-2"
                      />
                      <div>
                        <div className="text-primarytextcolor text-base font-medium font-ubuntu">
                          {matchUserData.name}
                        </div>
                        <div className="text-secondarytextcolor text-sm font-light ">
                          @{matchUserData.username}
                        </div>
                      </div>
                      <div className="font-normal text-base text-secondarytextcolor m-2 w-full">
                        {matchUserData.bio ? "bio · " + matchUserData.bio : ""}
                        <br />
                        {matchUserData.interest
                          ? "interest · " + matchUserData.interest
                          : ""}
                      </div>
                    </div>

                    <div className="flex items-center py-2 justify-center gap-5 w-full">
                      <button
                        onClick={searchPeople}
                        className="bg-neutral-800 w-[36%] lg:w-[25%] font-ubuntu font-normal text-base  py-2 rounded-full active:bg-neutral-700 flex items-center text-white justify-evenly"
                      >
                        <div>Pass</div>
                      </button>

                      <button
                        onClick={match}
                        className=" bg-indigo-500 w-[36%] lg:w-[25%] font-ubuntu font-normal text-base  py-2 rounded-full active:bg-indigo-500 flex text-white items-center justify-evenly"
                      >
                        <div>Connect</div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="text-center font-light font-ubuntu px-6  text-xs  text-secondarytextcolor">
                    <div className="w-full flex justify-center items-center">
                      <PeopleAltIcon
                        sx={{ fontSize: 60 }}
                        className="text-indigo-500 p-1 rounded-full"
                      />
                    </div>
                    <div className="text-center font-semibold font-ubuntu px-6 my-3  text-xl text-primarytextcolor">
                      Start Connecting with Kribble{" "}
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
                      className={`p-1 rounded-full
                    ${
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
                      className="text-background  rounded-full  bg-indigo-500 text-sm lg:text-lg py-2 px-4 font-ubuntu  active:bg-indigo-800"
                      onClick={searchPeople}
                    >
                      Start Connecting
                    </button>

                    <Link
                      className="text-background  text-center bg-neutral-800 rounded-full text-sm lg:text-lg  py-2 px-4 font-ubuntu  active:bg-neutral-800"
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
      </div>
    </>
  );
};
