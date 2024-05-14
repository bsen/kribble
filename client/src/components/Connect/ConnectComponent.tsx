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

export const ConnectComponent: React.FC = () => {
  const token = localStorage.getItem("token");
  const [matchUserData, setMatchUserData] = useState<UserData | null>(null);
  const [popup, setPopup] = useState<string>("");

  useEffect(() => {
    setPopup("");
    searchPeople();
  }, []);

  const searchPeople = async () => {
    setPopup("Searching ...");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/connect/connectable/users`,
        { token }
      );
      if (response.data.status === 200 && Array.isArray(response.data.user)) {
        if (response.data.user.length > 0) {
          setMatchUserData(response.data.user[0]);
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
    setPopup("Connect ...");

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/connect/create/connection`,
        {
          token,
          otherPersonsId: matchUserData?.id,
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
      <div className="bg-white border-l border-r border-neutral-100 h-screen flex flex-col justify-center items-center">
        <div className="w-full flex flex-col items-center justify-center">
          {popup && (
            <div
              className="text-neutral-600  font-light text-center text-lg"
              onClick={clearError}
            >
              {popup}
            </div>
          )}
          {matchUserData && !popup && (
            <div className="w-full flex flex-col justify-center items-center gap-2">
              <img
                src={matchUserData.image || "user.png"}
                className="max-w:w-[100%] lg:max-w-[50%] rounded-lg border border-neutral-100"
                alt="User"
              />
              <div className="text-primarytextcolor text-base font-medium font-ubuntu">
                {matchUserData.username}
              </div>
              <div className="font-light text-sm text-secondarytextcolor m-2 w-[50%]">
                {matchUserData.bio ? "bio · " + matchUserData.bio : ""}
              </div>
              <div className="flex items-center py-2 justify-center gap-5 w-full">
                <button
                  onClick={searchPeople}
                  className="bg-neutral-800 px-6 font-ubuntu font-normal text-base py-2 rounded-full active:bg-neutral-700 flex items-center text-white justify-evenly"
                >
                  <ClearIcon />
                </button>
                <button
                  onClick={match}
                  className="bg-indigo-500 px-6 font-ubuntu font-normal text-base py-2 rounded-full active:bg-indigo-500 flex text-white items-center justify-evenly"
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
