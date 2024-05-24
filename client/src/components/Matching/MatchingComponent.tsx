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

const interests = [
  "Programming",
  "Startup",
  "Drama",
  "Singing",
  "Dancing",
  "Writing",
  "Music",
  "Fashion",
  "Art",
  "Literature",
  "Sports",
  "Fitness",
  "Social Work",
  "Movies",
  "Anime",
  "Travel",
  "Photography",
  "Gaming",
  "Still figuring out",
];

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
  const [showMatches, setShowMatches] = useState(true);
  const [college, setCollege] = useState<string>("");
  const [interest, setInterest] = useState<string>("");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [popup, setPopup] = useState<string>("");

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCollegeChange = (event: SelectChangeEvent) => {
    setCollege(event.target.value as string);
  };

  const handleInterestChange = (event: SelectChangeEvent) => {
    setInterest(event.target.value as string);
  };

  const findMatch = async () => {
    try {
      if (!college) {
        return setPopup("Please select a college.");
      }
      if (!interest) {
        return setPopup("Please select a interest.");
      }
      console.log(college, interest);
      setPopup("Finding or Creating match...");
      const response = await axios.post(
        `http://localhost:8787/api/match/find/match`,
        {
          token,
          college,
          interest,
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

  const clearError = () => {
    setPopup("");
  };

  const fetchMatches = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8787/api/match/matches`,
        {
          token,
        }
      );
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
        <div className="h-screen px-2 py-10 w-full flex flex-col gap-5">
          <button
            onClick={() => {
              setShowMatches(false);
            }}
            className="bg-bordermain hover:bg-bgmain flex justify-center items-center w-fit text-indigomain ite py-1 px-4 rounded-full  mt-4"
          >
            <AddIcon /> Add matches
          </button>
          <div className="text-textmain text-center text-sm font-normal font-ubuntu bg-indigomain p-2 rounded-lg">
            Complete tasks within the time limit to score valuable city points .
            The higher your points, the better your rank on the leaderboards 🏆
          </div>
          <div className="w-full flex gap-4 overflow-x-auto no-scrollbar ">
            {matches.map((match) => (
              <div key={match.id} className="flex-shrink-0">
                <div className="bg-bgmain p-2 rounded-lg shadow-sm">
                  <img
                    src={
                      match.person2?.image ??
                      match.person1?.image ??
                      "/user.png"
                    }
                    className="h-56 w-56 rounded-lg border border-bordermain mb-2"
                  />

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
                    className="text-left font-light hover:underline underline-offset-2 text-texttwo text-lg"
                  >
                    {match.person2
                      ? match.person2.username
                      : match.person1
                      ? match.person1.username
                      : "User"}
                  </div>
                  <div className="text-left font-light text-texttwo text-sm">
                    Task: {match.task}
                  </div>
                  <div className="text-left font-light text-texttwo text-sm">
                    {match.isTaskCompleted ? "Task Completed" : "Task Pending"}
                  </div>

                  <div className="text-xs  text-indigomain mt-2">
                    {getFormattedRemainingTime(match.expiresAt)}
                  </div>
                </div>
              </div>
            ))}
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
        <div className="gap-4 flex flex-col items-center bg-bgmain p-3 justify-center rounded-lg w-[95%]">
          <img src="/people.png" className="h-16 w-16" alt="people" />
          <div className="text-center flex flex-col items-center justify-center gap-1">
            <div className="text-2xl font-normal text-textmain font-ubuntu">
              Find Your Match
            </div>
            <div className="text-xs text-texttwo font-light">
              Get matched with someone based on College, Interest, connections,
              interests, and college. Complete the assigned task with your match
              within 48 hours to get points and continue matching.
            </div>
          </div>
          <div className="w-full">
            <div className="text-texttwo text-sm font-light">College</div>
            <FormControl className="w-full">
              <Select
                sx={{
                  boxShadow: "none",
                  color: "rgb(210 210 210);",
                  ".MuiOutlinedInput-notchedOutline": { border: 0 },
                }}
                className="h-9 w-full text-texttwo rounded-lg focus:outline-none bg-bordermain"
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
          <div className="w-full">
            <div className="text-texttwo text-sm font-light">Interest</div>
            <FormControl className="w-full">
              <Select
                sx={{
                  boxShadow: "none",
                  color: "rgb(210 210 210);",
                  ".MuiOutlinedInput-notchedOutline": { border: 0 },
                }}
                className="h-9 w-full text-white rounded-lg focus:outline-none bg-bordermain"
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
                onChange={handleInterestChange}
                value={interest}
              >
                <MenuItem value="" disabled>
                  Select Interest
                </MenuItem>
                {interests.map((interest) => (
                  <MenuItem key={interest} value={interest}>
                    {interest}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <button
            onClick={findMatch}
            className="bg-indigomain text-center text-texttwo w-36 font-ubuntu font-normal py-1 text-base rounded-lg"
          >
            Create Match
          </button>
          <button
            onClick={() => {
              setShowMatches(true);
            }}
            className="bg-bgtwo text-center text-indigomain w-36 font-ubuntu font-normal py-1 text-base rounded-lg"
          >
            Check matches
          </button>
        </div>

        {popup && (
          <div
            className="absolute bottom-4 text-texttwo font-light text-center text-base"
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
