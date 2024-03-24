import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useEffect, useState } from "react";

export const Vitmatch = () => {
  const token = localStorage.getItem("token");
  const [matchingState, setMatchingState] = useState(false);
  const [matchUserData, setMatchUserData] = useState<{
    id: string;
    name: string;
    username: string;
    bio: string;
    image: string;
  }>({
    id: "",
    name: "",
    username: "",
    bio: "",
    image: "",
  });

  async function getMatchPeoples() {
    try {
      const response = await axios.post(
        "http://localhost:8787/api/server/v1/user/send-people-for-match",
        { token }
      );

      if (
        Array.isArray(response.data.message) &&
        response.data.message.length > 0
      ) {
        const { username, name, bio, image, id } = response.data.message[0];
        setMatchUserData({
          username,
          name,
          id,
          image,
          bio,
        });
        setMatchingState(true);
      } else {
        console.log("No matched user found");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async function match() {
    const otherPersonsId = matchUserData.id;
    try {
      const response = await axios.post(
        "http://localhost:8787/api/server/v1/user/match_people",
        { token, otherPersonsId }
      );

      console.log(response.data.message);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="h-screen w-[50%] bg-black flex flex-col justify-between">
        <div className="w-full flex justify-center">
          <div className="text-3xl bg-black  text-white font-mono w-[80%] text-center py-5 border-b border-bordercolor">
            Vit Match
          </div>
        </div>
        {matchingState ? (
          <div className="w-full flex flex-col items-center justify-center ">
            <img
              src={matchUserData.image}
              className="rounded-xl max-h-[40vh] max-w-[80%]"
            />
            <div className="my-4 w-[80%]">
              <div className="flex gap-2">
                <p className="font-light text-base text-gray-200">
                  {matchUserData.name}
                </p>
                <p className=" font-light text-base text-gray-200">
                  @{matchUserData.username}
                </p>
              </div>
              <p className=" font-light text-sm text-gray-200">
                {matchUserData.bio}
              </p>
            </div>

            <div className="flex py-2 justify-evenly w-full">
              <div>
                <button
                  onClick={getMatchPeoples}
                  className="bg-white border font-mono font-light border-bordercolor hover:bg-black text-indigo-500 text-xl px-4 py-1 rounded-lg"
                >
                  <div className="flex items-center justify-evenly">
                    <div>Pass</div>
                    <CloseIcon className="text-inidgo-500" />
                  </div>
                </button>
              </div>
              <div>
                <button
                  onClick={match}
                  className="bg-white border font-mono font-light border-bordercolor hover:bg-black text-pink-500 text-xl px-4 py-1 rounded-lg"
                >
                  <div className="flex items-center justify-evenly">
                    <div>Date</div>
                    <FavoriteIcon className="text-pink-500" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="w-full flex justify-center items-center">
              <img
                src="https://imagedelivery.net/cV-2jw5Z4EJcAnIlwLPzWw/2ce483df-43ad-4e37-444d-409aae925f00/public"
                className=" h-12 w-12"
              />
            </div>

            <div className="text-center font-extralight px-6 my-5  text-lg font-sans text-gray-200">
              Now find dates in your campus, start matching with undate
            </div>
            <div className="w-full flex justify-center">
              <div className="text-white bg-bordercolor rounded-lg text-2xl py-1 px-3 font-mono  border border-dashed border-white">
                <button onClick={getMatchPeoples}>start matching</button>
              </div>
            </div>
          </div>
        )}

        <p className="my-4 text-center font-mono font-thin text-xs text-bordercolor">
          © 2024 undate Ltd / biswarup sen production
        </p>
      </div>
    </>
  );
};
