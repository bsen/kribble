import { CircularProgress, FormControl, MenuItem, Select } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { SelectChangeEvent } from "@mui/material/Select";

interface Leader {
  id: string;
  username: string;
  image: string;
}

export const LeaderBoardComponent = () => {
  const token = localStorage.getItem("token");
  const [LeadersData, setLeadersData] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboardType, setLeaderboardType] =
    useState<string>("weekly-college");

  async function getLeaders() {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/leaderboard/users/leaderboard`,
        { token, leaderboardType }
      );
      setLeadersData(response.data.leaders);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getLeaders();
  }, [leaderboardType]);

  const handleLeaderboardTypeChange = (event: SelectChangeEvent) => {
    setLeaderboardType(event.target.value as string);
  };

  return (
    <>
      <div className="h-screen overflow-y-auto no-scrollbar py-12 ">
        <div className="text-lg font-ubuntu text-semilight fonr-normal text-center mt-2">
          Leaders
        </div>
        <div className="flex justify-center my-4">
          <FormControl className="w-full">
            <Select
              sx={{
                boxShadow: "none",
                color: "rgb(210 210 210);",
                ".MuiOutlinedInput-notchedOutline": { border: 0 },
              }}
              className="h-9 w-full text-sm text-semilight rounded-lg focus:outline-none bg-semidark"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250,
                    overflow: "auto",
                    backgroundColor: "rgb(18 18 18)",
                    color: "rgb(210 210 210)",
                  },
                },
                disableScrollLock: true,
                disablePortal: true,
              }}
              value={leaderboardType}
              onChange={handleLeaderboardTypeChange}
            >
              <MenuItem value="alltime-all">Top leaders</MenuItem>
              <MenuItem value="weekly-all">Top weekly leaders</MenuItem>
              <MenuItem value="alltime-college">College leaders</MenuItem>
              <MenuItem value="weekly-college">College weekly leaders</MenuItem>
            </Select>
          </FormControl>
        </div>
        {LeadersData.length > 0 ? (
          LeadersData.map((leader, index) => (
            <div
              key={index}
              className="my-4 p-2 rounded-lg border border-semidark bg-dark"
            >
              <Link to={`/${leader.username}`}>
                <div className="flex justify-between gap-2">
                  <div className="flex gap-2 items-center">
                    <img
                      className="h-5 w-5 rounded-lg bg-dark"
                      src={leader.image ? leader.image : "/user.png"}
                    />
                    <div className="flex flex-col w-full text-base  text-light">
                      {leader.username}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div>
            {isLoading ? (
              <div className="w-full my-5 flex justify-center items-center">
                <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
              </div>
            ) : (
              <div className="text-semilight my-5 font-light text-center text-lg">
                No leaders found
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
