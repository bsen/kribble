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
  const handleEmailChnage = (text: string) => {
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

      if (response.data.status == 200) {
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
      <div className=" flex justify-center items-center h-screen w-full text-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="h-screen w-full  bg-bgmain flex justify-center items-center">
          <div className="w-[80%] lg:w-[50%] grid gap-y-2">
            <div className="text-textmain text-center font-ubuntu text-[2rem]">
              Login
            </div>

            <div>
              <div className="font-semibold m-1 text-textmain">Email</div>
              <input
                value={email}
                onChange={(e) => {
                  handleEmailChnage(e.target.value);
                }}
                type="email"
                className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-bordermain"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <div className="font-semibold m-1 text-textmain">Password</div>
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                onKeyDown={handleKeyDown}
                className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-bordermain"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={login}
              className="my-4 w-full text-textmain bg-neutral-800 hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:ring-neutral-700 dark:border-neutral-800"
            >
              Login
            </button>
            <div className="text-center text-md font-light text-textmain">
              Don't have an account?
              <Link
                to="/signup"
                className="font-semibold text-textmain underline underline-offset-2 mx-1"
              >
                Sign up
              </Link>
            </div>
            <div className="text-rosemain font-ubuntu font-light text-center text-sm">
              {popup ? popup : <div>‎</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
