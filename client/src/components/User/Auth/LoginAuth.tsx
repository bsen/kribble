import { useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Loading } from "../../Loading";

export const LoginAuth = () => {
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState("");
  const handleEmailChnage = (text: string) => {
    const newEmail = text.toLowerCase();
    setEmail(newEmail);
  };
  async function login() {
    setPopup("");
    if (!email) {
      setPopup("Please enter your email");
      return;
    }
    if (!password) {
      setPopup("Please enter your password");

      return;
    }
    try {
      setLoadingState(true);
      const data = { email, password };
      const response = await axios.post(
        `${BACKEND_URL}/api/user/auth/login`,
        data
      );
      setLoadingState(false);
      if (response.data.status == 200) {
        const jwt = response.data.token;
        localStorage.setItem("token", jwt);
        navigate("/home");
        return;
      }
      setPopup(response.data.message);
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

  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div>
          <div className="h-screen w-full  bg-white flex justify-center items-center">
            <div className="w-[80%] lg:w-[50%] grid gap-y-2">
              <div className="text-neutral-800 text-center font-ubuntu text-[2rem]">
                Login
              </div>

              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Email
                </div>
                <input
                  value={email}
                  onChange={(e) => {
                    handleEmailChnage(e.target.value);
                  }}
                  type="email"
                  className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-100"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Password
                </div>
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  type="password"
                  onKeyDown={handleKeyDown}
                  className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-100"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={login}
                className="my-4 w-full text-white bg-neutral-800 hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:ring-neutral-700 dark:border-neutral-800"
              >
                Login
              </button>
              <div className="text-center text-md font-light text-neutral-800">
                Don't have an account?
                <Link
                  to="/signup"
                  className="font-semibold text-primarytextcolor underline underline-offset-2 mx-1"
                >
                  Sign up
                </Link>
              </div>
              <div className="text-rose-500 font-ubuntu font-light text-center text-sm">
                {popup ? popup : <div>‎</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
