import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";

interface Leader {
  id: string;
  username: string;
  image: string;
}

const LeaderBoardComponent: React.FC = () => {
  const token = localStorage.getItem("token");
  const [isWeekly, setIsWeekly] = useState<boolean>(true);

  const [leaderBoardData, setLeaderBoardData] = useState<{
    topThreeLeaders: Leader[];
    otherLeaders: Leader[];
  }>({ topThreeLeaders: [], otherLeaders: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderBoardData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/leaderboard/users/${
          isWeekly ? "weekly" : "alltime"
        }-leaderboard`,
        {
          token,
        }
      );
      const topThree: Leader[] =
        response.data.WeeklyLeaderFromSameCollege.slice(0, 3);
      const otherLeaders: Leader[] =
        response.data.WeeklyLeaderFromSameCollege.slice(3);
      setLeaderBoardData({ topThreeLeaders: topThree, otherLeaders });
      setIsLoading(false);
    } catch (error) {
      setError(error as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderBoardData();
  }, [isWeekly]); // Re-fetch data when isWeekly changes

  const handleToggle = () => {
    setIsWeekly((prevIsWeekly) => !prevIsWeekly);
  };
  if (error) {
    return (
      <div className="text-center my-10 text-red-500 font-normal">
        An error occurred: {error.message}
      </div>
    );
  }
  return (
    <div className="container mx-auto mt-8">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <button onClick={handleToggle} className="mb-4">
            Show {isWeekly ? "All-Time" : "Weekly"} Leaders
          </button>
          <div className="flex flex-col items-center">
            <h2 className="mb-4">Top Leaders</h2>
            <div className="flex justify-center mb-4">
              {leaderBoardData.topThreeLeaders.map((leader) => (
                <LeaderCard key={leader.id} leader={leader} isTopLeader />
              ))}
            </div>
            <h2>All Leaders</h2>
            <div className="grid grid-cols-3 gap-4">
              {leaderBoardData.otherLeaders.map((leader) => (
                <LeaderCard key={leader.id} leader={leader} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface LeaderCardProps {
  leader: Leader;
  isTopLeader?: boolean;
}

const LeaderCard: React.FC<LeaderCardProps> = ({ leader, isTopLeader }) => {
  return (
    <div
      className={`rounded-md border p-4 ${
        isTopLeader ? "bg-green-100" : "bg-white"
      }`}
    >
      <img
        src={leader.image}
        alt={leader.username}
        className="w-16 h-16 rounded-full mx-auto mb-2"
      />
      <p className="text-center">{leader.username}</p>
    </div>
  );
};

export default LeaderBoardComponent;
