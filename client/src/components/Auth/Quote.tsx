import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import { BACKEND_URL } from "../../config";
import axios from "axios";
import { useEffect, useState } from "react";

export const Quote = () => {
  const [usersCount, setUsersCount] = useState("");
  async function getUsersCount() {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/server/v1/auth/users-count`
      );
      setUsersCount(response.data.message);
    } catch (error) {
      console.log(error);
    }
  }
  console.log(usersCount);

  useEffect(() => {
    getUsersCount();
  }, []);
  return (
    <div className="h-screen bg-black w-full flex items-center justify-center px-[10vw] lg:px-[5vw]">
      <div className="grid">
        <div className="w-full flex items-center">
          <div className="bg-gradient-to-r text-[5rem] font-ubuntu from-violet-500 via-orange-500 to-indigo-500  text-transparent bg-clip-text">
            Kribble
          </div>
        </div>
        <div>
          <div className=" text-white text-xl font-light font-ubuntu">
            Join the exclusive social media platform built just for college
            students.
          </div>
        </div>
        {usersCount ? (
          <div className=" text-white font-normal text-3xl my-5 font-ubuntu ">
            Joined by {usersCount}k +
          </div>
        ) : (
          "‎"
        )}

        <div className="lg:hidden text-left">
          <button
            onClick={() => {
              scroll(0, 1000);
            }}
          >
            <ArrowDownwardRoundedIcon
              className="text-white border my-5 border-neutral-600 rounded-full"
              sx={{ fontSize: 50 }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
