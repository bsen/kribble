import React, { useState, useEffect } from "react";
import axios from "axios";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { BACKEND_URL } from "../../config";
import { NavBar } from "../Bars/NavBar";
import { BottomBar } from "../Bars/BottomBar";

interface UserData {
  id: string;
  username: string;
  bio: string;
  image: string;
}

export const MatchingComponent: React.FC = () => {
  const token = localStorage.getItem("token");
  const [matchableUserData, setMatchableUserData] = useState<UserData | null>(
    null
  );
  const [popup, setPopup] = useState<string>("");

  useEffect(() => {
    setPopup("");
    searchPeople();
  }, []);

  const searchPeople = async () => {
    try {
      setPopup("Searching ...");
      const response = await axios.post(
        `${BACKEND_URL}/api/match/matchable/users`,
        { token }
      );
      setPopup("");
      if (response.data.status === 200 && Array.isArray(response.data.user)) {
        if (response.data.user.length > 0) {
          setMatchableUserData(response.data.user[0]);
        } else {
          setPopup("No users found for connecting, Please try again later.");
        }
      } else {
        setPopup("Error while searching for users, Please try again later.");
      }
    } catch (error) {
      console.error("Error while searching for users:", error);
      setPopup("Error while searching for users. Please try again later.");
    }
  };
  const match = async () => {
    setPopup("Creating connection ...");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/match/create/connection`,
        {
          token,
          recipientId: matchableUserData?.id,
        }
      );
      if (response.data.status === 400) {
        setPopup("You've already liked their profile");
      } else if (response.data.status === 404) {
        setPopup("Failed due to network error. Please try again.");
      } else if (response.data.status === 200) {
        setPopup("You liked their profile");
      }
    } catch (error) {
      console.error("Error while matching:", error);
      setPopup("Error while matching. Please try again later.");
    } finally {
      searchPeople();
    }
  };

  const clearError = () => {
    setPopup("");
  };

  return (
    <>
      <NavBar />
      <div className="bg-bgmain h-screen flex flex-col justify-center items-center">
        <div className="w-full flex flex-col items-center justify-center">
          {popup && (
            <div
              className="text-texttwo  font-light text-center text-lg"
              onClick={clearError}
            >
              {popup}
            </div>
          )}
          {matchableUserData && !popup && (
            <div className="w-full flex flex-col justify-center items-center gap-2">
              <img
                src={matchableUserData.image || "user.png"}
                className="w-[80%] md:max-w-[50%] rounded-full border border-bordermain"
                alt="User"
              />
              <div className="text-textmain text-base font-medium font-ubuntu">
                {matchableUserData.username}
              </div>
              <div className="font-light text-center text-sm text-secondarytextcolor m-2 w-[50%]">
                {matchableUserData.bio ? matchableUserData.bio : ""}
              </div>
              <div className="flex items-center py-2 justify-center gap-5 w-full">
                <button
                  onClick={searchPeople}
                  className="bg-neutral-800 px-6 font-ubuntu font-normal text-base py-2 rounded-full active:bg-neutral-700 flex items-center text-textmain justify-evenly"
                >
                  <ClearIcon />
                </button>
                <button
                  onClick={match}
                  className="bg-indigomain px-6 font-ubuntu font-normal text-base py-2 rounded-full active:bg-indigomain flex text-textmain items-center justify-evenly"
                >
                  <CheckIcon />
                </button>
              </div>
            </div>
          )}
        </div>
        <BottomBar />
      </div>
    </>
  );
};
