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
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />{" "}
      </div>
    );
  }

  return (
    <>
      <div className="md:flex justify-between items-center">
        <div className="h-screen p-3 w-full md:w-[50%] flex justify-center items-center bg-indigomain">
          <div className="text-semilight text-center mb-4 font-ubuntu font-medium text-[2.5rem]">
            FriendCity
            <div className="text-center text-sm font-thin mb-8 text-light">
              A place where college life meets limitless fun! 🎉 Share your
              moments, cool pics, and dive into vibrant communities. With our
              anonymous posting, let your thoughts soar freely, conquer exciting
              challenges, and skyrocket to the top of the leaderboard! 🚀. Get
              ready to unleash the epicness – join us now!
            </div>
            <div className="flex flex-wrap mb-5 justify-center gap-2">
              <img
                src="/girl.png"
                className="h-[15%] w-[15%] rounded-lg bg-semidark"
                alt="Girl"
              />
              <img
                src="/boy.png"
                className="h-[15%] w-[15%] rounded-lg bg-semidark"
                alt="Boy"
              />
              <img
                src="/people.png"
                className="h-[15%] w-[15%] rounded-lg bg-semidark"
                alt="People"
              />
              <img
                src="/girl2.png"
                className="h-[15%] w-[15%] rounded-lg bg-semidark"
                alt="Girl 2"
              />
              <img
                src="/boy2.png"
                className="h-[15%] w-[15%] rounded-lg bg-semidark"
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
              className="lg:hidden rounded-lg bg-white text-indigomain px-4 py-1 text-lg"
            >
              Join now
            </button>
          </div>
        </div>
        <div className="ww-full md:w-[50%] bg-black flex flex-col items-center justify-center  h-screen">
          <div className="w-[80%] bg-dark p-5 rounded-lg flex flex-col items-center gap-5">
            <div className="w-full">
              <div className="text-semilight text-sm font-ubuntu mb-1">
                Email
              </div>
              <input
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                type="email"
                className="h-7 w-full text-dark rounded-lg px-4 focus:outline-none bg-light"
                placeholder="Enter your email address"
              />
            </div>

            <div className="w-full">
              <div className="text-semilight text-sm font-ubuntu mb-1">
                Password
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                onKeyDown={handleKeyDown}
                className="h-7 w-full text-dark rounded-lg px-4 focus:outline-none bg-light"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={login}
              className="bg-indigomain w-full mt-2 rounded-lg text-white py-1.5 px-10"
            >
              Login
            </button>
            <div className="text-center">
              <Link to="/signup" className="text-sm text-semilight font-ubuntu">
                Don't have an account? Signup
              </Link>
            </div>
          </div>
          {popup && (
            <div className="text-rosemain text-sm text-center">{popup}</div>
          )}
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
