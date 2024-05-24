import { useContext, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { UserContext } from "../Context/UserContext";

export const LoginAuth = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState("");

  const handleEmailChange = (text: string) => {
    const newEmail = text.toLowerCase();
    setEmail(newEmail);
  };

  async function login() {
    if (!email || !password) {
      setPopup("Please fill in all the fields");
      return;
    }
    try {
      setIsLoading(true);
      const data = { email, password };
      const response = await axios.post(
        `${BACKEND_URL}/api/user/auth/login`,
        data
      );

      if (response.data.status === 200) {
        localStorage.setItem("token", response.data.token);
        setCurrentUser(response.data.username);
        navigate("/");
        return;
      } else {
        setPopup(response.data.message);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setPopup("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      login();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full text-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <div className="lg:flex justify-between items-center">
        <div className="h-screen p-3 flex justify-center items-center w-full bg-indigomain">
          <div className="text-semilight text-center mb-4 font-ubuntu font-medium text-[2.5rem]">
            FriendCity
            <div className="text-center text-sm font-thin mb-8 text-light">
              A place where college life meets limitless fun! 🎉 Share your
              moments, snap cool pics, and dive into vibrant communities. With
              our anonymous posting, let your thoughts soar freely. But wait,
              there's more! Join forces with a fellow student, conquer exciting
              challenges, and skyrocket to the top of the leaderboard! 🚀 Get
              ready to unleash the epicness, starting at the top 20 colleges.
              Don't miss out on the adventure – join us now!
            </div>
            <div className="flex flex-wrap mb-5 justify-center gap-2">
              <img
                src="/girl.png"
                className="h-[15%] w-[15%] rounded-full bg-semidark"
                alt="Girl"
              />
              <img
                src="/boy.png"
                className="h-[15%] w-[15%] rounded-full bg-semidark"
                alt="Boy"
              />
              <img
                src="/people.png"
                className="h-[15%] w-[15%] rounded-full bg-semidark"
                alt="People"
              />
              <img
                src="/girl2.png"
                className="h-[15%] w-[15%] rounded-full bg-semidark"
                alt="Girl 2"
              />
              <img
                src="/boy2.png"
                className="h-[15%] w-[15%] rounded-full bg-semidark"
                alt="Boy 2"
              />
            </div>
            <button
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth",
                });
              }}
              className="lg:hidden rounded-full bg-white text-indigomain px-4 py-1 text-lg"
            >
              Join now
            </button>
          </div>
        </div>
        <div className="flex flex-col h-screen bg-dark justify-center items-center p-3 w-full">
          <div className="items-center p-2 rounded-lg bg-semidark w-[80%] lg:w-[50%]">
            <div>
              <div className="font-normal m-1 text-semilight">Email</div>
              <input
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                type="email"
                className="h-9 w-full text-light rounded-lg px-4 focus:outline-none bg-dark"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <div className="font-normal m-1 text-semilight">Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                onKeyDown={handleKeyDown}
                className="h-9 w-full text-light rounded-lg px-4 focus:outline-none bg-dark"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={login}
              className="my-4 w-full text-semilight bg-indigomain active:bg-dark border border-semidark focus:outline-none focus:ring-2 focus:ring-neutral-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
            >
              Login
            </button>
            <div className="text-center text-md font-light text-light">
              Don't have an account?
              <Link
                to="/signup"
                className="font-normal text-light underline underline-offset-4 mx-1"
              >
                Sign up
              </Link>
            </div>
          </div>
          <div className="text-rosemain mt-2 font-light text-center text-xs">
            {popup ? popup : <div>‎</div>}
          </div>
          <footer className="w-full font-ubuntu py-2 text-xs flex flex-col gap-2 items-center justify-center text-neutral-600">
            © 2024 FriendCity Ltd.
            <Link to="/policies" className="underline">
              Policies
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
};
