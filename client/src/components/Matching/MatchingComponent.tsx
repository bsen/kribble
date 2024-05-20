import React, { useState, useEffect } from "react";
import axios from "axios";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { BACKEND_URL } from "../../config";
import { NavBar } from "../Bars/NavBar";
import { BottomBar } from "../Bars/BottomBar";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { UserData } from "../User/Profile/UserData";

const interests = [
  "Programming",
  "Drama",
  "Singing",
  "Dancing",
  "Sports",
  "Fitness",
  "Social Work",
  "Environmental Work",
  "Entrepreneurship",
  "Movies",
  "Travel",
  "Photography",
  "Writing",
  "Music",
  "Fashion",
  "Gaming",
  "Art",
  "Literature",
  "Still figuring out",
];

const colleges = [
  "VIT Vellore",
  "VIT Chennai",
  "VIT Amaravati",
  "VIT Bhopal",
  "BITS Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "SRMIST Kattankulathur",
  "SRMIST Amaravati",
  "SRMIST NCR",
  "MIT Manipal",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT Guwahati",
  "NIT Trichy",
  "NIT Surathkal",
  "NIT Warangal",
  "NIT Calicut",
  "NIT Rourkela",
  "NIT Kurukshetra",
  "NIT Durgapur",
  "NSUT",
  "DTU",
  "IGDTUW",
  "Other",
];

interface UserData {
  id: string;
  username: string;
  bio: string;
  image: string;
  college: string;
  interest: string;
}

export const MatchingComponent: React.FC = () => {
  const token = localStorage.getItem("token");
  const [isMatching, setIsMatching] = useState(false);
  const [matchableUserData, setMatchableUserData] = useState<UserData | null>(
    null
  );
  const [popup, setPopup] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>(
    []
  );
  const [selectedColleges, setSelectedColleges] = React.useState<string[]>([]);

  useEffect(() => {
    setPopup("");
  }, []);

  const searchPeople = async () => {
    try {
      setIsMatching(true);
      setPopup("Searching ...");
      const response = await axios.post(
        `${BACKEND_URL}/api/match/matchable/users`,
        { token, interests: selectedInterests, colleges: selectedColleges }
      );
      setPopup("");
      if (response.data.status === 200) {
        if (response.data.user) {
          setMatchableUserData(response.data.user);
        } else {
          setPopup("No users found for matching, Please try again later.");
          setIsMatching(false);
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
    setPopup("Creating match ...");
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

  const handleInterestChange = (
    event: SelectChangeEvent<typeof selectedInterests>
  ) => {
    const {
      target: { value },
    } = event;
    const newInterests = typeof value === "string" ? value.split(",") : value;

    if (newInterests.length > 3) {
      return;
    }

    setSelectedInterests(newInterests);
  };

  const handleCollegeChange = (
    event: SelectChangeEvent<typeof selectedColleges>
  ) => {
    const {
      target: { value },
    } = event;
    const newColleges = typeof value === "string" ? value.split(",") : value;

    if (newColleges.length > 3) {
      return;
    }

    setSelectedColleges(newColleges);
  };

  return (
    <>
      <NavBar />
      <div className="bg-bgmain h-screen flex flex-col justify-center items-center">
        <div className="w-full flex flex-col items-center justify-center">
          {!isMatching && (
            <div className="h-screen  w-full flex flex-col justify-center items-center p-2">
              <div className=" bg-bgtwo p-4 shadow-sm rounded-lg">
                <div className="flex flex-col items-center justify-center gap-2">
                  <img src="/people.png" className="h-16 w-16" />
                  <div className="text-center flex flex-col items-center justify-center gap-1">
                    <div className="text-2xl  font-normal text-textmain font-ubuntu">
                      Start matching in FriendCity
                    </div>
                    <div className="text-xs  text-texttwo font-light">
                      Filter based on colleges and interests.
                      <br /> Check your matches from Inbox.
                    </div>
                  </div>
                </div>
                <div className="w-full mt-8 flex flex-col justify-center items-start">
                  <div className="text-texttwo text-sm font-light">
                    Select Colleges
                  </div>

                  <FormControl className="w-full">
                    <Select
                      sx={{
                        boxShadow: "none",
                        color: "rgb(210 210 210);",
                        ".MuiOutlinedInput-notchedOutline": { border: 0 },
                      }}
                      className="h-9 w-full text-texttwo rounded-lg focus:outline-none bg-bgmain"
                      multiple
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
                      value={selectedColleges}
                      onChange={handleCollegeChange}
                      renderValue={(selected) => selected.join(", ")}
                    >
                      {colleges.map((college) => (
                        <MenuItem key={college} value={college}>
                          <Checkbox
                            checked={selectedColleges.indexOf(college) > -1}
                          />
                          <ListItemText primary={college} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="w-full my-4 flex flex-col justify-center items-start">
                  <div className="text-texttwo text-sm font-light">
                    Select Interests
                  </div>
                  <FormControl className="w-full">
                    <Select
                      sx={{
                        boxShadow: "none",
                        color: "rgb(210 210 210);",
                        ".MuiOutlinedInput-notchedOutline": { border: 0 },
                      }}
                      className="h-9 w-full text-texttwo rounded-lg focus:outline-none bg-bgmain"
                      multiple
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
                      value={selectedInterests}
                      onChange={handleInterestChange}
                      renderValue={(selected) => selected.join(", ")}
                    >
                      {interests.map((interest) => (
                        <MenuItem key={interest} value={interest}>
                          <Checkbox
                            checked={selectedInterests.indexOf(interest) > -1}
                          />
                          <ListItemText primary={interest} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={searchPeople}
                    className="bg-indigomain text-center text-texttwo px-6 font-ubuntu font-normal text-base py-2 rounded-lg"
                  >
                    Start Matching
                  </button>
                </div>
              </div>
              {popup && (
                <div
                  className="text-texttwo mt-4 font-light text-center text-xs"
                  onClick={clearError}
                >
                  {popup}
                </div>
              )}
            </div>
          )}

          {isMatching && matchableUserData && !popup && (
            <div className="flex bg-bgtwo p-2 rounded-lg shadow-sm  items-center flex-col justify-center">
              <img
                src={matchableUserData.image || "user.png"}
                className="w-60 rounded-lg border border-bordermain"
              />
              <div className="text-textmain my-2 text-base font-medium font-ubuntu">
                {matchableUserData.username}
              </div>
              {matchableUserData.bio && (
                <div className="font-light  text-xs text-texttwo ">
                  {matchableUserData.bio ? matchableUserData.bio : ""}
                </div>
              )}
              {matchableUserData.college && (
                <div className="font-light  text-xs text-texttwo ">
                  {matchableUserData.college ? matchableUserData.college : ""}
                </div>
              )}
              {matchableUserData.interest && (
                <div className="font-light  text-xs text-texttwo">
                  {matchableUserData.interest ? matchableUserData.interest : ""}
                </div>
              )}
              <div className="flex items-center my-4 justify-center gap-5 w-full">
                <button
                  onClick={searchPeople}
                  className="bg-textmain text-bgmain px-6 font-ubuntu font-normal text-base py-1 rounded-lg"
                >
                  <ClearIcon />
                </button>
                <button
                  onClick={match}
                  className="bg-indigomain text-texttwo px-6 font-ubuntu font-normal text-base py-1 rounded-lg"
                >
                  <CheckIcon />
                </button>
              </div>
            </div>
          )}
        </div>
        {popup && (
          <div
            className="text-texttwo mt-4 font-light text-center text-sm"
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
