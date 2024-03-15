import { useState } from "react";
import { motion } from "framer-motion";

import axios from "axios";
import { Link } from "react-router-dom";

export const SignupAuth = () => {
  const api = "http://localhost:3000/user/signup";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [popup, setPopup] = useState(false);
  const [sucPopup, setSucPopup] = useState(false);

  const [popText, setpopText] = useState("");

  const validateUsername = (char: string) => {
    return char.match(/^[a-z0-9_]$/i);
  };
  const validatePassword = (char: string) => {
    return char.match(/^[A-Za-z0-9@#]$/i);
  };

  const handleUsernameChange = (text: string) => {
    const newUsername = text
      .split("")
      .filter(validateUsername)
      .join("")
      .toLowerCase();
    setUsername(newUsername);
  };
  const handlePasswordChnage = (text: string) => {
    const newPassword = text.split("").filter(validatePassword).join("");
    setPassword(newPassword);
  };

  function popupFn() {
    setPopup(true);
    setTimeout(() => {
      setPopup(false);
    }, 5000);
  }
  function succes() {
    setUsername("");
    setGender("");
    setPassword("");
    setSucPopup(true);
    setTimeout(() => {
      setSucPopup(false);
    }, 10000);
  }
  async function signup() {
    if (!email) {
      setpopText("Please verify with your VIT student email first!");
      popupFn();
      return;
    }
    if (!email.endsWith("@vitstudent.ac.in")) {
      setpopText(
        "Please logout and verify your valid VIT student email with google!"
      );
      popupFn();
      return;
    }
    if (username.length < 3) {
      setpopText("Username length should be mininmum 3 characters!");
      popupFn();
      return;
    }
    if (username.length > 20) {
      setpopText("Username length should be maximum 20 characters!");
      popupFn();
      return;
    }

    if (password.length < 6) {
      setpopText("Password length should be minimum 6!");
      popupFn();
      return;
    }
    if (gender == null) {
      setpopText("Please select your gender 🙎‍♂️🙍‍♀️");
      popupFn();
      return;
    }
    const userdata = { username, email, gender, password };
    try {
      axios.post(api, userdata).then((res) => {
        if (res.data.status === 200) {
          succes();
        } else if (res.data.status === 101) {
          setpopText("This email is already used 😢");
          popupFn();
        } else if (res.data.status === 102) {
          setpopText("Username is already taken 😢");
          popupFn();
        }
      });
    } catch (error) {
      console.log(error);
      alert("Network error, try again later");
    }
    console.log(username, password, email, gender);
  }

  return (
    <>
      {popup && (
        <div className="absolute top-5 right-5">
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 1 }}
          >
            <div className="rounded-lg bg-white border border-indigo-300 shadow-sm p-5 ">
              {popText ? (
                <div>{popText}</div>
              ) : (
                <div>hi, This is just a alert 👋</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {sucPopup && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 1 }}
          >
            <div className="rounded-lg bg-white border border-indigo-300 shadow-sm p-20 text-center text-lg">
              Congratulations! Your registration is complete 🎉.
              <br /> Please go to Undate app and login using your credentials.
            </div>
          </motion.div>
        </div>
      )}

      <div className="h-screen w-full  bg-white flex justify-center items-center">
        <div className="w-[80%] lg:w-[50%] grid gap-y-2">
          <div className="text-gray-700 font-light text-[2rem] text-center my-4">
            Create an undate account
          </div>

          <div>
            <p className="font-semibold m-1 text-gray-700">Name</p>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-gray-300"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <p className="font-semibold m-1 text-gray-700">Username</p>{" "}
            <input
              value={username}
              onChange={(e) => {
                handleUsernameChange(e.target.value);
              }}
              className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-gray-300"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <p className="font-semibold m-1 text-gray-700">Email</p>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-gray-300"
              placeholder="example@vitstudent.ac.in"
            />
          </div>
          <div>
            <p className="font-semibold m-1 text-gray-700">Gender</p>{" "}
            <select
              className="h-10 w-full rounded-lg px-4 text-gray-400 bg-white border border-gray-300"
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <p className="font-semibold m-1 text-gray-700">Password</p>
            <input
              value={password}
              onChange={(e) => {
                handlePasswordChnage(e.target.value);
              }}
              className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-gray-300"
              placeholder="Enter password"
            />
          </div>
          <button
            onClick={() => {
              console.log(name, username, email, password);
            }}
            className="my-4 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          >
            Register
          </button>
          <div className="text-center text-md font-light text-gray-800">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-gray-700 underline underline-offset-2"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
