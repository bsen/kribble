import { useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./Firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { UserContext } from "../Context/UserContext";
import { EMAIL_AUTH_KEY } from "../../../config";
interface DebouncedFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const debouncedFunc: DebouncedFunction<T> = (...args: Parameters<T>) => {
    cancel();
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };

  debouncedFunc.cancel = cancel;
  return debouncedFunc;
}

export const SignupAuth = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [available, setAvailable] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [popup, setPopup] = useState<string>("");

  const [date, setDate] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const validateUsername = (char: string) => /^[a-z0-9_]$/i.test(char);
  const validatePassword = (char: string) => /^[A-Za-z0-9@#]$/i.test(char);

  const handleUsernameChange = (text: string) => {
    const newUsername = text
      .split("")
      .filter(validateUsername)
      .join("")
      .toLowerCase();
    setUsername(newUsername);
    debouncedCheckName(newUsername);
  };

  const handlePasswordChange = (text: string) => {
    const newPassword = text.split("").filter(validatePassword).join("");
    setPassword(newPassword);
  };

  const handleDateChange = (text: string) => {
    const newDate = text.replace(/\D/g, "");
    setDate(newDate);
    setPopup(
      newDate.length !== 2 && newDate !== "0"
        ? "Please provide a valid date (two characters)"
        : ""
    );
  };

  const handleMonthChange = (text: string) => {
    const newMonth = text.replace(/\D/g, "");
    setMonth(newMonth);
    setPopup(
      newMonth.length !== 2 && newMonth !== "0"
        ? "Please provide a valid month (two characters)"
        : ""
    );
  };

  const handleYearChange = (text: string) => {
    const newYear = text.replace(/\D/g, "");
    setYear(newYear);
    setPopup(
      newYear.length !== 4 && newYear !== "0"
        ? "Please provide a valid year (four characters)"
        : ""
    );
  };

  const checkName = async (username: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/user/auth/username/check`,
        { username }
      );
      if (response.data.status === 401) {
        setAvailable(false);
        setPopup(response.data.message);
      } else {
        setAvailable(true);
        setPopup("");
      }
    } catch (error) {
      console.error(error);
      setPopup("Network error, please try again later");
    }
  };

  const debouncedCheckName = debounce(checkName, 1000);
  useEffect(() => {
    debouncedCheckName(username);
    return () => debouncedCheckName.cancel();
  }, [username]);

  const isThirteen = () => {
    const today = new Date();
    const birthDate = new Date(
      parseInt(year?.toString() || "0") - 1,
      parseInt(month?.toString() || "0") - 1,
      parseInt(date?.toString() || "0") - 1
    );
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age >= 13;
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      const email = result.user.email;
      if (email) {
        setEmail(email);
        setPopup("");
      } else {
        setPopup("Failed to retrieve email from Google");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setPopup("Google Sign-In failed. Please try again.");
    }
  };

  const signup = async () => {
    setPopup("");
    if (!email) {
      return setPopup("Please verify an Email with Google");
    }
    if (!username) {
      return setPopup("Enter a Username");
    }
    if (username === "anonymous") {
      return setPopup("This Username can't be taken");
    }

    if (password.length < 6) {
      return setPopup("Password length should be minimum 6");
    }
    if (
      !date ||
      !month ||
      !year ||
      String(year).length < 4 ||
      String(month).length < 2 ||
      String(date).length < 2
    ) {
      return setPopup("Date format must be like DD/MM/YYYY");
    }

    if (!isThirteen()) {
      return setPopup("You must be at least 13 years old to register");
    }

    if (parseInt(month) === 2 && parseInt(date) === 29) {
      const isLeapYear =
        (parseInt(year) % 4 === 0 && parseInt(year) % 100 !== 0) ||
        parseInt(year) % 400 === 0;
      if (!isLeapYear) {
        return setPopup("Invalid date");
      }
    }

    const userdata = {
      username,
      email,
      password,
      year,
      month,
      date,
      EMAIL_AUTH_KEY,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/auth/signup`,
        userdata
      );
      if (response.data.status === 401) {
        setIsLoading(false);
        setPopup(response.data.message);
        setEmail("");
      }
      if (response.data.status === 200) {
        setPopup("Sign up successful");
        localStorage.setItem("token", response.data.token);
        setCurrentUser(response.data.username);
        navigate("/");
      } else {
        setIsLoading(false);
        setPopup(response.data.message);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setPopup("Network error, try again later");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center w-full">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }

  return (
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
        {!email && (
          <div className="w-full">
            <button
              type="button"
              className="rounded-md text-base p-2 text-light bg-indigomain flex items-center gap-4 w-full"
              onClick={handleGoogle}
            >
              <img src="/google.png" className="h-6 w-6" />
              Verify with Google
            </button>
          </div>
        )}

        {email && (
          <>
            <div className="w-full">
              <div className="text-semilight text-sm font-ubuntu mb-1">
                Username
              </div>
              <input
                type="text"
                value={username}
                maxLength={24}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Username"
                className={`w-full text-dark p-2 bg-light focus:outline-none  rounded-lg ${
                  available ? "" : "border border-rosemain"
                }`}
                required
              />
            </div>
            <div className="w-full">
              <div className="text-semilight text-sm font-ubuntu mb-1">
                Password
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Password"
                className="bg-light w-full outline-none rounded-md text-dark placeholder:text-sm p-2"
                required
              />
            </div>
            <div className="w-full flex gap-2">
              <div className="w-1/3">
                <div className="text-semilight text-sm font-ubuntu mb-1">
                  Date
                </div>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  placeholder="DD"
                  maxLength={2}
                  className="bg-light w-full outline-none rounded-md text-dark placeholder:text-sm p-2"
                  required
                />
              </div>
              <div className="w-1/3">
                <div className="text-semilight text-sm font-ubuntu mb-1">
                  Month
                </div>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  placeholder="MM"
                  maxLength={2}
                  className="bg-light w-full outline-none rounded-md text-dark placeholder:text-sm p-2"
                  required
                />
              </div>
              <div className="w-1/3">
                <div className="text-semilight text-sm font-ubuntu mb-1">
                  Year
                </div>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  placeholder="YYYY"
                  maxLength={4}
                  className="bg-light w-full outline-none rounded-md text-dark placeholder:text-sm p-2"
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={signup}
              className="bg-indigomain w-full mt-2 rounded-lg text-white h-10"
            >
              Sign Up
            </button>
          </>
        )}
        <div className="text-center">
          <Link to="/login" className="text-sm text-semilight font-ubuntu">
            Already have an account? Log in
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
  );
};
