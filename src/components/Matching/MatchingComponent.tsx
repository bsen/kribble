import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { NavBar } from "../Bars/NavBar";
import { BottomBar } from "../Bars/BottomBar";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

interface MatchData {
  id: string | null;
  task: string | null;
  isTaskCompleted: boolean;
  expiresAt: string;
  matchedUser: {
    id: string;
    username: string;
    image: string;
  };
}

export const MatchingComponent: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [popup, setPopup] = useState<string>("");

  useEffect(() => {
    fetchMatches();
  }, []);

  const findMatch = async () => {
    try {
      setPopup("Finding or Creating match...");
      const response = await axios.post(
        `${BACKEND_URL}/api/match/create/match`,
        {
          token,
        }
      );
      setPopup("");
      if (response.data.status === 200) {
        fetchMatches();
      } else {
        setPopup(response.data.message);
      }
    } catch (error) {
      console.error("Error while finding a match:", error);
      setPopup("Error while finding a match. Please try again later.");
    }
  };

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/match/matches`, {
        token,
      });
      setIsLoading(false);
      if (response.data.status === 200) {
        setMatches(response.data.data);
      }
    } catch (error) {
      console.error("Error while fetching matches:", error);
    }
  };
  const getFormattedRemainingTime = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt);
    const currentDate = new Date();
    const diffInMilliseconds = expirationDate.getTime() - currentDate.getTime();

    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}h ${formattedMinutes}m match life remaining`;
  };

  return (
    <>
      <div className="h-screen overflow-y-auto flex flex-col items-center no-scrollbar py-12 ">
        <NavBar />
        <div className="w-full mb-3 flex flex-col items-center text-semilight bg-dark text-center text-sm font-normal mt-3 font-ubuntu p-2 rounded-lg">
          <div>
            Complete tasks within the time limit to score valuable city points .
            The higher your points, the better your rank on the leaderboards 🏆
          </div>
          <button
            onClick={findMatch}
            className="bg-indigomain mt-5 text-center text-semilight px-4 font-ubuntu font-normal py-0.5 text-sm rounded-lg"
          >
            <AddIcon /> Add matches
          </button>
        </div>
        <div className="flex flex-col">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div key={match.id}>
                <div className="bg-dark p-3 mb-3 rounded-lg shadow-sm">
                  <div className="flex mb-2 items-center justify-start gap-2">
                    <div className="flex justify-center">
                      <img
                        src={
                          match.matchedUser.image
                            ? match.matchedUser.image
                            : "/user.png"
                        }
                        className="w-7 h-7 rounded-lg border border-semidark object-cover"
                      />
                    </div>
                    <div
                      onClick={() => {
                        navigate(
                          `/${
                            match.matchedUser.username
                              ? match.matchedUser.username
                              : ""
                          }`
                        );
                      }}
                      className="text-light w-fit font-medium hover:underline underline-offset-2  text-lg rounded-lg"
                    >
                      {match.matchedUser ? match.matchedUser.username : ""}
                    </div>
                  </div>
                  <div className=" my-3 text-xs text-semilight">
                    <div className="flex items-center gap-2">
                      <div className="text-left font-light">
                        {match.isTaskCompleted ? (
                          <div className="text-green-400">Task Completed</div>
                        ) : (
                          <div className="text-orange-400">Task Pending</div>
                        )}
                      </div>
                      <div>· {getFormattedRemainingTime(match.expiresAt)}</div>{" "}
                    </div>
                    <div className="text-left font-light mb-2 text-semilight text-sm">
                      Task: {match.task}
                    </div>
                  </div>

                  {!match.isTaskCompleted && (
                    <button
                      onClick={() => {
                        navigate("/create/post");
                      }}
                      className="bg-indigomain text-center text-semilight w-fit px-4 font-ubuntu font-normal py-1 text-base rounded-lg"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="w-full">
              {!isLoading && (
                <div className="text-semilight my-5 font-light text-center text-sm">
                  No matches found
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={findMatch}
          className="bg-semidark my-5 text-center text-semilight px-4 font-ubuntu font-normal py-0.5 text-sm rounded-lg"
        >
          <AddIcon /> Add matches
        </button>
        {isLoading && (
          <div className="w-full my-5 flex justify-center items-center">
            <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
          </div>
        )}{" "}
        {popup && (
          <div className="text-rosemain text-sm text-center">{popup}</div>
        )}
        <BottomBar />
      </div>
    </>
  );
};

export default MatchingComponent;
