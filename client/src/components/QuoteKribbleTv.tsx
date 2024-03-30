import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowCircleLeftRoundedIcon from "@mui/icons-material/ArrowCircleLeftRounded";
import { useNavigate } from "react-router-dom";
export const QuoteKribbleTv = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full flex items-center justify-center bg-orange-500 px-[10vw] lg:px-[5vw]">
      <div className="grid">
        <div>
          <button
            onClick={() => {
              navigate("/home");
            }}
          >
            <ArrowCircleLeftRoundedIcon sx={{ fontSize: 50 }} /> back
          </button>{" "}
        </div>
        <div className="w-full flex items-center">
          <div className="text-white text-[5rem] font-ubuntu">Kribble Tv</div>
        </div>
        <div>
          <div className=" text-neutral-950 text-3xl font-light font-ubuntu ">
            Find strangers to your friends at Kribble Tv. 🥳
          </div>
          <div className=" text-neutral-950 text-xl font-light my-5">
            Join kribble tv for random video chat with strangers or friends
            anonymously.
            <br />
            <div className="text-sm my-4 text-neutral-950 font-ubuntu">
              1. Kribble will not store any kind of data.
              <br /> 2. Do not share any sensitive information.
              <br /> 3. Nudity and Harrasment is strictly prohivited.
              <br /> 4. Accounts may got blocked if any policy violation
              noticed.
            </div>
          </div>
        </div>
        <div className="lg:hidden text-left">
          <button
            onClick={() => {
              scroll(0, 1000);
            }}
          >
            <ArrowDownwardRoundedIcon
              className="text-white border my-5 border-neutral-200 rounded-full"
              sx={{ fontSize: 50 }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
