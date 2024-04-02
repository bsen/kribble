import { useNavigate } from "react-router-dom";

export const QuoteMatchMaker = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="h-screen bg-black border-l border-r border-bordercolor flex flex-col justify-between">
        <div className="w-full flex justify-center">
          <div className="text-2xl  text-white font-ubuntu w-[70%] text-center py-4 border-b border-bordercolor">
            Match Maker
          </div>
        </div>
        <div>
          <div className="text-center font-light font-ubuntu px-6 mb-5 text-xs  text-neutral-400">
            <div className="w-full flex justify-center items-center">
              <img src="/love.png" className=" h-12 w-12" />
            </div>
            <div className="text-center font-semibold font-ubuntu px-6 my-3  text-lg text-neutral-400">
              start matching with kribble
            </div>
            1. Your profile picture will be used for matching.
            <br /> 2. Your bio will be shown in the matching.
            <br /> 3. Your matches will be updated on
            <span className="text-pink-500"> Matches </span>
            section.
          </div>
          <div className="w-full flex justify-center">
            <div>
              <button
                onClick={() => {
                  navigate("/matchmaker");
                }}
                className="text-neutral-300 bg-blue-800 rounded-lg text-xl py-2 px-4 font-ubuntu  active:bg-blue-700"
              >
                start matching
              </button>
            </div>
          </div>
        </div>
        <div>
          <div className="my-4 text-center font-thin text-xs text-neutral-500 font-ubuntu">
            © 2024 kribble Ltd
          </div>
        </div>
      </div>
    </>
  );
};
