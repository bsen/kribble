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
      <div className="h-screen flex flex-col justify-center bg-black items-center">
        <div className="w-72 bg-dark p-5 rounded-lg flex flex-col items-center gap-4">
          <div className="text-semilight text-center font-ubuntu font-medium text-[2.5rem]">
            <div className="bg-gradient-to-r from-indigo-500 to-orange-500 via-purple-500 text-transparent font-normal bg-clip-text text-4xl mb-4 font-ubuntu">
              FriendCity
            </div>
            <div className="text-center text-sm font-thin  text-light">
              Share your thoughts 🚀, pics, and dive into vibrant communities.
              With anonymous posting, let your thoughts soar freely.
            </div>
          </div>

          <div className="w-full">
            <div className="text-semilight text-sm font-ubuntu mb-1">Email</div>
            <input
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              type="email"
              className="w-full text-dark rounded-lg p-2 focus:outline-none bg-light"
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
              className=" w-full text-dark rounded-lg p-2 focus:outline-none bg-light"
              placeholder="Enter password"
            />
          </div>
          <button
            onClick={login}
            className="bg-indigomain w-full mt-2 rounded-lg text-white h-10"
          >
            Login
          </button>
          <div className="text-center">
            <Link to="/signup" className="text-sm text-semilight font-ubuntu">
              Don't have an account? Signup
            </Link>
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
