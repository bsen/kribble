import { useState } from "react";
import { motion } from "framer-motion";
import { BACKEND_URL } from "../config";
import CircularProgress from "@mui/material/CircularProgress";

import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export const LoginAuth = () => {
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState(false);
  const [popText, setpopText] = useState("");
  function popupFn() {
    setPopup(true);
    setTimeout(() => {
      setPopup(false);
    }, 5000);
  }
  async function login() {
    if (!email.endsWith("@vitstudent.ac.in")) {
      setpopText("Please enter your VIT student email!");
      popupFn();
      return;
    }
    if (password.length == 0) {
      setpopText("Enter your password!");
      popupFn();
      return;
    }
    try {
      setLoadingState(true);
      const data = { email, password };
      axios
        .post(`${BACKEND_URL}/api/server/v1/user/login`, data)
        .then((response) => {
          setLoadingState(false);
          if (response.data.status == 200) {
            const jwt = response.data.message;
            localStorage.setItem("token", jwt);
            navigate("/home");
          }
          if (response.data.status == 403) {
            setpopText("Email or Password is invalid");
            popupFn();
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {loadingState ? (
        <div className="h-screen bg-black/60 flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div>
          {popup && (
            <div className="absolute top-5 left-5">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="rounded-lg bg-white border border-bordercolor shadow-sm px-5 py-2 ">
                  {popText ? (
                    <div>{popText}</div>
                  ) : (
                    <div>hi, This is just a alert 👋</div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
          <div className="h-screen w-full  bg-white flex justify-center items-center">
            <div className="w-[80%] lg:w-[50%] grid gap-y-2">
              <div className="text-neutral-800 text-center font-mono text-[2rem]">
                Login
              </div>

              <div>
                <p className="font-semibold m-1 text-neutral-700">Email</p>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-300"
                  placeholder="example@vitstudent.ac.in"
                />
              </div>

              <div>
                <p className="font-semibold m-1 text-neutral-700">Password</p>
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-300"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={login}
                className="my-4 w-full text-white bg-neutral-800 hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:ring-neutral-700 dark:border-neutral-700"
              >
                Login
              </button>
              <div className="text-center text-md font-light text-neutral-800">
                Don't have an account?
                <Link
                  to="/signup"
                  className="font-semibold text-neutral-700 underline underline-offset-2 mx-1"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
