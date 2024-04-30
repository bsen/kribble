import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Loading } from "../Loading";

export const SignupAuth = () => {
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [available, setAvailable] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [gender, setGender] = useState("");
  const [popup, setPopup] = useState("");

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
  const handleEmailChnage = (text: string) => {
    const newEmail = text.toLowerCase();
    setEmail(newEmail);
  };
  const handlePasswordChnage = (text: string) => {
    const newPassword = text.split("").filter(validatePassword).join("");
    setPassword(newPassword);
  };

  async function checkName() {
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/auth/check-name`,
      { username }
    );
    if (response.data.status === 101) {
      setPopup("This username is already taken");
      return setAvailable(false);
    }
    if (response.data.status === 102) {
      setPopup("");
      return setAvailable(true);
    }
  }
  useEffect(() => {
    setPopup("");
    checkName();
  }, [username]);

  async function signup() {
    setPopup("");
    if (available == false) {
      return setPopup("This username is already taken");
    }
    if (!name) {
      setPopup("Enter a valid name");
      return;
    }
    if (!username) {
      setPopup("Enter a valid username");
      return;
    }

    if (!email) {
      setPopup("Please enter your email address");

      return;
    }
    if (!gender) {
      setPopup("Please select your gender");
      return;
    }
    if (password.length < 6) {
      setPopup("Password should be minimum 6 characters");
      return;
    }
    if (!confirmPass) {
      setPopup("Please confirm your password");
      return;
    }
    if (password !== confirmPass) {
      setPopup("Passwords are not same");
      return;
    }
    const userdata = { name, username, email, gender, password };
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/auth/signup`,
        userdata
      );
      setLoadingState(false);
      if (response.data.status === 200) {
        const jwt = response.data.token;
        localStorage.setItem("token", jwt);
        setName("");
        setUsername("");
        setEmail("");
        setGender("");
        setGender("");
        setPassword("");
        setPopup("");
        navigate("/home");

        return;
      }
      setPopup(response.data.message);
    } catch (error) {
      console.log(error);
      setPopup("Network error, try again later");
    }
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      signup();
    }
  };
  const [passState, setPassState] = useState(false);
  useEffect(() => {
    if (confirmPass == password) {
      setPassState(false);
    } else {
      setPassState(true);
    }
  }, [confirmPass]);

  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div>
          <div className="h-screen w-full  bg-white flex justify-center items-center">
            <div className="w-[80%] lg:w-[60%] md:w-[40%] grid gap-y-2">
              <div className="text-neutral-800 font-ubuntu text-[1.5rem] text-center my-4">
                Create an account
              </div>

              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Name
                </div>
                <input
                  value={name}
                  maxLength={20}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-300"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Username
                </div>
                <input
                  value={username}
                  maxLength={20}
                  onChange={(e) => {
                    handleUsernameChange(e.target.value);
                  }}
                  className={`w-full h-10 px-4 border border-neutral-300 focus:outline-none  rounded-lg ${
                    available ? "" : "border border-rose-500"
                  }`}
                  placeholder="Enter your username"
                />
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
                  className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-300"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Gender
                </div>{" "}
                <select
                  className="h-10 w-full rounded-lg px-4 text-secondarytextcolor border border-neutral-300 appearance-none"
                  onChange={(e) => setGender(e.target.value)}
                  value={gender}
                >
                  <option value="" className="text-secondarytextcolor">
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Password
                </div>
                <input
                  value={password}
                  onChange={(e) => {
                    handlePasswordChnage(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-300"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Confirm your password
                </div>
                <input
                  value={confirmPass}
                  type="password"
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  className={`${
                    passState ? "border border-rose-500" : ""
                  } h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-300`}
                  placeholder="Confirm password"
                />
              </div>
              <button
                onClick={signup}
                className="my-4 w-full text-white bg-neutral-800 hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:ring-neutral-700 dark:border-neutral-700"
              >
                Register
              </button>
              <div className="text-center text-md font-light text-neutral-800">
                Already have an account?
                <Link
                  to="/login"
                  className="font-semibold text-primarytextcolor underline underline-offset-2 mx-1"
                >
                  Login
                </Link>
              </div>
              <div className="text-rose-500 font-ubuntu font-light text-center text-sm">
                {popup ? popup : "‎"}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
