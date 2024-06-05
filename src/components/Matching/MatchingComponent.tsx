import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { NavBar } from "../Bars/NavBar";
import { BottomBar } from "../Bars/BottomBar";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
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

const colleges = [
  "VIT Vellore",
  "VIT Chennai",
  "VIT Bhopal",
  "BITS Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "SRMIST",
  "MIT Manipal",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "NIT Trichy",
  "NIT Surathkal",
  "NIT Durgapur",
  "NSUT",
  "DTU",
  "IGDTUW",
  "Other",
];

export const MatchingComponent: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showMatches, setShowMatches] = useState(true);
  const [college, setCollege] = useState<string>("");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [popup, setPopup] = useState<string>("");

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCollegeChange = (event: SelectChangeEvent) => {
    setCollege(event.target.value as string);
  };

  const findMatch = async () => {
    try {
      if (!college) {
        return setPopup("Please select a college.");
      }
      setPopup("Finding or Creating match...");
      const response = await axios.post(
        `${BACKEND_URL}/api/match/create/match`,
        {
          token,
          college,
        }
      );
      setPopup("");
      if (response.data.status === 200) {
        fetchMatches();
        setShowMatches(true);
      } else {
        setPopup(response.data.message);
      }
    } catch (error) {
      console.error("Error while finding a match:", error);
      setPopup("Error while finding a match. Please try again later.");
    }
  };

  const clearError = () => {
    setPopup("");
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
  if (showMatches) {
    return (
      <>
        <div className="h-screen overflow-y-auto flex flex-col items-center no-scrollbar py-12 ">
          <NavBar />
          <div className="text-semilight text-center text-sm font-normal my-2 font-ubuntu  p-2 rounded-lg">
            Complete tasks within the time limit to score valuable city points .
            The higher your points, the better your rank on the leaderboards 🏆
          </div>
          <div className="flex flex-col gap-4">
            {matches.length > 0 ? (
              matches.map((match) => (
                <div key={match.id}>
                  <div className="bg-dark p-3 rounded-lg shadow-sm">
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
                    <div className="text-left font-light mb-2 text-semilight text-sm">
                      Task: {match.task}
                    </div>
                    {!match.isTaskCompleted && (
                      <button className="bg-indigomain text-center text-semilight w-full font-ubuntu font-normal py-1 text-base rounded-lg">
                        Post
                      </button>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-semilight">
                      <div className="text-left font-light">
                        {match.isTaskCompleted ? (
                          <div className="text-green-400">Task Completed</div>
                        ) : (
                          <div className="text-rose-400">Task Pending</div>
                        )}
                      </div>
                      <div>· {getFormattedRemainingTime(match.expiresAt)}</div>{" "}
                    </div>
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
            onClick={() => {
              setShowMatches(false);
            }}
            className="bg-semidark my-5 text-center text-semilight w-36 font-ubuntu font-normal py-1 text-base rounded-lg"
          >
            <AddIcon /> Add matches
          </button>
          {isLoading && (
            <div className="w-full my-5 flex justify-center items-center">
              <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
            </div>
          )}
          <BottomBar />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="h-screen flex flex-col justify-center items-center">
        <div className="gap-4 flex flex-col items-center bg-dark p-3 py-6 justify-center rounded-lg lg:w-[70%]  w-[90%]">
          <img src="/people.png" className="h-16 w-16" alt="people" />
          <div className="text-center flex flex-col items-center justify-center gap-1">
            <div className="text-2xl font-normal text-light font-ubuntu">
              Find Your Match
            </div>
            <div className="text-xs text-semilight font-light">
              Get matched with someone based on College, Interest, connections,
              interests, and college. Complete the assigned task with your match
              within 48 hours to get points and continue matching.
            </div>
          </div>
          <div className="w-full mb-4">
            <div className="text-semilight text-sm font-light mb-1">
              College
            </div>
            <FormControl className="w-full">
              <Select
                sx={{
                  boxShadow: "none",
                  color: "rgb(210 210 210);",
                  ".MuiOutlinedInput-notchedOutline": { border: 0 },
                }}
                className="h-9 w-full text-semilight rounded-lg focus:outline-none bg-semidark"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      width: 250,
                      overflow: "auto",
                    },
                  },
                  disableScrollLock: true,
                  disablePortal: true,
                }}
                onChange={handleCollegeChange}
                value={college}
              >
                <MenuItem value="" disabled>
                  Select College
                </MenuItem>
                {colleges.map((college) => (
                  <MenuItem key={college} value={college}>
                    {college}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <button
            onClick={findMatch}
            className="bg-indigomain text-center text-semilight w-32 font-ubuntu font-normal py-1 text-base rounded-lg"
          >
            Create Match
          </button>
          <button
            onClick={() => {
              setShowMatches(true);
            }}
            className="bg-semidark text-center text-semilight w-32 font-ubuntu font-light py-1 text-base rounded-lg"
          >
            Task matches
          </button>
        </div>

        {popup && (
          <div
            className="absolute bottom-4 text-semilight font-light text-center text-base"
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

export default MatchingComponent;
