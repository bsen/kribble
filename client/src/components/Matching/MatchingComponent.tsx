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

interface UserData {
  id: string;
  username: string;
  image: string | null;
}
interface MatchData {
  id: string | null;
  task: boolean | null;
  isTaskCompleted: boolean;
  expiresAt: string;
  person1: UserData;
  person2: UserData;
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

    return `${formattedHours}h ${formattedMinutes}m remaining`;
  };
  console.log(matches);
  if (showMatches) {
    return (
      <>
        <div className="h-screen overflow-y-auto flex flex-col items-center no-scrollbar py-12 md:py-0">
          <NavBar />
          <div className="text-semilight text-center text-sm font-normal my-2 font-ubuntu  p-2 rounded-lg">
            Complete tasks within the time limit to score valuable city points .
            The higher your points, the better your rank on the leaderboards 🏆
          </div>
          <div className="w-60 flex flex-col gap-4">
            {matches.length > 0 ? (
              matches.map((match) => (
                <div key={match.id}>
                  <div className="bg-dark p-2 rounded-lg shadow-sm">
                    <div className="flex justify-center">
                      <img
                        src={
                          match.person2?.image ??
                          match.person1?.image ??
                          "/user.png"
                        }
                        className="w-full rounded-lg border border-semidark mb-2 object-cover"
                      />
                    </div>
                    <div
                      onClick={() => {
                        navigate(
                          `/${
                            match.person2
                              ? match.person2.username
                              : match.person1
                              ? match.person1.username
                              : ""
                          }`
                        );
                      }}
                      className="text-left font-light hover:underline underline-offset-2 text-semilight text-lg"
                    >
                      {match.person2
                        ? match.person2.username
                        : match.person1
                        ? match.person1.username
                        : "User"}
                    </div>
                    <div className="text-left font-light text-semilight text-sm">
                      Task: {match.task}
                    </div>
                    <div className="text-left font-light text-semilight text-sm">
                      {match.isTaskCompleted
                        ? "Task Completed"
                        : "Task Pending"}
                    </div>

                    <div className="text-xs  text-indigomain mt-2">
                      {getFormattedRemainingTime(match.expiresAt)}
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
            className="bg-indigomain my-5 text-center text-semilight w-36 font-ubuntu font-normal py-1 text-base rounded-lg"
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
        <div className="gap-4 flex flex-col items-center bg-dark p-3 justify-center rounded-lg w-[95%]">
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
          <div className="w-full">
            <div className="text-semilight text-sm font-light">College</div>
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
            className="bg-indigomain text-center text-semilight w-36 font-ubuntu font-normal py-1 text-base rounded-lg"
          >
            Create Match
          </button>
          <button
            onClick={() => {
              setShowMatches(true);
            }}
            className="bg-semidark text-center text-semilight w-36 font-ubuntu font-light py-1 text-base rounded-lg"
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
