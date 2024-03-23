import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";

export const Vitmatch = () => {
  return (
    <div className="h-screen w-[50%] bg-black flex flex-col justify-between">
      <div className="w-full flex justify-center">
        <div className="text-3xl bg-black  text-white font-mono w-[80%] text-center py-5 border-b border-bordercolor">
          Vit Match
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center ">
        <img
          src="https://imagedelivery.net/cV-2jw5Z4EJcAnIlwLPzWw/5da2ca8e-0167-4468-a160-9a8a541c2700/public"
          className="h-[50vh] rounded-xl"
        />

        <div className="flex py-5 justify-evenly w-full">
          <div>
            <button className="bg-white border font-mono font-light border-bordercolor hover:bg-black text-indigo-500 text-xl px-4 py-1 rounded-lg">
              <div className="flex items-center justify-evenly">
                <div>Pass</div>
                <CloseIcon className="text-inidgo-500" />
              </div>
            </button>
          </div>
          <div>
            <button className="bg-white border font-mono font-light border-bordercolor hover:bg-black text-pink-500 text-xl px-4 py-1 rounded-lg">
              <div className="flex items-center justify-evenly">
                <div>Date</div>
                <FavoriteIcon className="text-pink-500" />
              </div>
            </button>
          </div>
        </div>
      </div>
      <p className="my-4 text-center font-mono font-thin text-xs text-bordercolor">
        © 2024 undate Ltd / biswarupz production
      </p>
    </div>
  );
};
