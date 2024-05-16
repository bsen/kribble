import { useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { UserContext } from "../Context/UserContext";

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
  const [fullname, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [popup, setPopup] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [year, setYear] = useState<string>("");

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
    debouncedCheckName(newUsername);
  };

  const handleEmailChange = (text: string) => {
    const newEmail = text.toLowerCase();
    setEmail(newEmail);
  };

  const handlePasswordChange = (text: string) => {
    const newPassword = text.split("").filter(validatePassword).join("");
    setPassword(newPassword);
  };

  const checkName = async (username: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/user/auth/username/check`,
        {
          username: username,
        }
      );

      if (response.data.status === 101) {
        setAvailable(false);
        setPopup("This username is already taken");
      } else {
        setAvailable(true);
        setPopup("");
      }
    } catch (error) {
      console.error(error);
      setPopup("Network error, please try again later");
    }
  };

  const debouncedCheckName = debounce(checkName, 1500);

  useEffect(() => {
    debouncedCheckName(username);

    return () => {
      debouncedCheckName.cancel();
    };
  }, [username]);

  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const getDaysInMonth = (month: number, year: number) => {
    const days31 = [1, 3, 5, 7, 8, 10, 12];
    const days30 = [4, 6, 9, 11];
    if (days31.includes(month)) {
      return 31;
    } else if (days30.includes(month)) {
      return 30;
    } else {
      return isLeapYear(year) ? 29 : 28;
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const renderOptions = (start: number, end: number) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i);
    }
    return options.map((option) => (
      <option key={option} value={option.toString()}>
        {option}
      </option>
    ));
  };

  const renderMonthOptions = () => {
    return monthNames.map((month, index) => (
      <option key={index} value={(index + 1).toString()}>
        {month}
      </option>
    ));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      signup();
    }
  };

  async function signup() {
    setPopup("");
    if (
      !fullname ||
      !username ||
      !email ||
      !password ||
      !year ||
      !month ||
      !date
    ) {
      setPopup("Please fill in all the fields");
      return;
    }

    if (username === "unknown" || username === "anonymous") {
      setPopup("This username can't be taken");
      return;
    }

    if (password.length < 6) {
      setPopup("Password length should be minimum 6");
      return;
    }

    if (!isEighteen()) {
      setPopup("You must be at least 18 years old to register");
      return;
    }

    const userdata = {
      fullname,
      username,
      email,
      password,
      year,
      month,
      date,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/auth/signup`,
        userdata
      );
      if (response.data.status === 200) {
        setPopup("Sign up successful");
        localStorage.setItem("token", response.data.token);
        setCurrentUser(response.data.username);
        navigate("/");
      } else {
        setPopup(response.data.message);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setPopup("Network error, try again later");
    }
  }

  const isEighteen = () => {
    const today = new Date();
    const birthDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(date)
    );
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age >= 18;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center w-full">
        <CircularProgress />
      </div>
    );
  }
  return (
    <div className="h-screen w-full p-2  flex justify-evenly items-center bg-bgmain">
      <div className="w-[100%] lg:w-[40%]">
        <div className="text-textmain text-center mb-6 font-ubuntu font-light text-2xl">
          Create your profile on Introsium
        </div>

        <div className="items-center p-2 rounded-md bg-bgtwo border border-bordermain">
          <div className="my-2 flex gap-2">
            <img
              src="/people.png"
              className="h-20 w-20  rounded-full border border-bordermain bg-bgtwo"
            />
            <img
              src="/girl.png"
              className="h-20 w-20  rounded-full border border-bordermain bg-bgtwo"
            />
            <img
              src="/boy.png"
              className="h-20 w-20  rounded-full border border-bordermain bg-bgtwo"
            />
          </div>

          <div>
            <div className="font-normal m-1 text-textmain">Full Name</div>
            <input
              value={fullname}
              maxLength={20}
              onChange={(e) => {
                setFullName(e.target.value);
              }}
              className=" h-9 w-full rounded-lg px-4 focus:outline-none border border-bordermain"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-textmain">Username</div>
            <input
              value={username}
              maxLength={20}
              onChange={(e) => {
                handleUsernameChange(e.target.value);
              }}
              className={`w-full h-9 px-4 border border-bordermain focus:outline-none  rounded-lg ${
                available ? "" : "border border-rosemain"
              }`}
              placeholder="Select your username"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-textmain">Email</div>
            <input
              value={email}
              onChange={(e) => {
                handleEmailChange(e.target.value);
              }}
              className=" h-9 w-full rounded-lg px-4 focus:outline-none border border-bordermain"
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-textmain">Password</div>
            <input
              value={password}
              onChange={(e) => {
                handlePasswordChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              className=" h-9 w-full rounded-lg px-4 focus:outline-none border border-bordermain"
              placeholder="Enter password"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-textmain">Birthday</div>
            <div className="flex gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-9 w-28 rounded-lg px-4 focus:outline-none border border-bordermain"
              >
                <option value="">Month</option>
                {renderMonthOptions()}
              </select>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 w-20 rounded-lg px-4 focus:outline-none border border-bordermain"
              >
                <option value="">Date</option>
                {renderOptions(
                  1,
                  getDaysInMonth(parseInt(month), parseInt(year))
                )}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-9 w-28 rounded-lg px-4 focus:outline-none border border-bordermain"
              >
                <option value="">Year</option>
                {renderOptions(1975, new Date().getFullYear())}
              </select>
            </div>
          </div>

          <button
            onClick={signup}
            disabled={isLoading}
            className="my-4 w-full text-textmain bg-indigomain active:bg-bgmain border border-bordermain focus:outline-none focus:ring-2 focus:ring-bordermain font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Register
          </button>
          <div className="text-center text-md font-light text-textmain">
            Already have an account?
            <Link
              to="/login"
              className="font-semibold text-textmain underline underline-offset-2 mx-1"
            >
              Login
            </Link>
          </div>
          <div className="text-rosemain font-ubuntu font-light text-center text-sm">
            {popup ? popup : <div>‎</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
