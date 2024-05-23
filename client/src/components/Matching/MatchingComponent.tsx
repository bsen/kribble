import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { NavBar } from "../Bars/NavBar";
import { BottomBar } from "../Bars/BottomBar";

interface UserData {
  id: string;
  username: string;
  bio: string | null;
  image: string | null;
  college: string | null;
  interest: string | null;
}

export const MatchingComponent: React.FC = () => {
  const token = localStorage.getItem("token");
  const [matchedUserData, setMatchedUserData] = useState<UserData | null>(null);
  const [popup, setPopup] = useState<string>("");

  useEffect(() => {
    setPopup("");
  }, []);

  const findMatch = async () => {
    try {
      setPopup("Finding or Creating match...");
      const response = await axios.post(`${BACKEND_URL}/api/match/find/match`, {
        token,
      });
      setPopup("");
      if (response.data.status === 200) {
        setMatchedUserData(response.data.matchedUser);
      } else if (response.data.status === 400) {
        setPopup(response.data.message);
      } else {
        setPopup("Error while finding a match. Please try again later.");
      }
    } catch (error) {
      console.error("Error while finding a match:", error);
      setPopup("Error while finding a match. Please try again later.");
    }
  };

  const clearError = () => {
    setPopup("");
  };
  if (matchedUserData) {
    return (
      <>
        <div className="w-full h-screen flex flex-col gap-4 justify-center items-center">
          <div className="flex w-fit bg-bgmain p-3 rounded-lg shadow-sm items-center flex-col justify-center">
            <img
              src={matchedUserData.image || "user.png"}
              className="w-52 rounded-lg border border-bordermain"
            />
            <div className="text-textmain my-2 text-base font-medium font-ubuntu">
              {matchedUserData.username}
            </div>
            {matchedUserData.bio && (
              <div className="font-light text-xs text-texttwo">
                {matchedUserData.bio}
              </div>
            )}
            {matchedUserData.college && (
              <div className="font-light text-xs text-texttwo">
                {matchedUserData.college}
              </div>
            )}
            {matchedUserData.interest && (
              <div className="font-light text-xs text-texttwo">
                {matchedUserData.interest}
              </div>
            )}
          </div>
          <div className="text-textmain text-center px-5 font-light">
            Congratulations! You've matched with {matchedUserData.username} 🎉
          </div>
        </div>
        <BottomBar />
      </>
    );
  }
  return (
    <>
      <NavBar />
      <div className="h-screen flex flex-col justify-center items-center">
        <div className=" px-3 py-6 gap-4 flex flex-col items-center justify-center rounded-lg w-fit">
          <img src="/people.png" className="h-16 w-16" />
          <div className="text-center flex flex-col items-center justify-center gap-1">
            <div className="text-2xl font-normal text-textmain font-ubuntu">
              Find Your Match
            </div>
            <div className="text-xs text-texttwo font-light">
              Get matched with someone based on your connections, interests, and
              college. Complete the assigned task with your match within 48
              hours to get points and continue matching.
            </div>
          </div>

          <button
            onClick={findMatch}
            className="bg-indigomain text-center text-texttwo px-6 font-ubuntu font-normal text-base py-2 rounded-lg"
          >
            Find Match
          </button>
        </div>

        {popup && (
          <div
            className="absolute bottom-4 text-texttwo font-light text-center text-sm"
            onClick={clearError}
          >
            {popup}
          </div>
        )}

        <BottomBar />
      </div>
    </>
  );
};
