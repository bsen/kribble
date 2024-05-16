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

  const handleDateChange = (text: string) => {
    const newDate = text.replace(/\D/g, ""); // Remove non-numeric characters
    setDate(newDate);

    if (newDate.length !== 2) {
      setPopup("Please provide a valid date (two characters)");
    } else {
      setPopup("");
    }
  };

  const handleMonthChange = (text: string) => {
    const newMonth = text.replace(/\D/g, ""); // Remove non-numeric characters
    setMonth(newMonth);

    if (newMonth.length !== 2) {
      setPopup("Please provide a valid month (two characters)");
    } else {
      setPopup("");
    }
  };

  const handleYearChange = (text: string) => {
    const newYear = text.replace(/\D/g, ""); // Remove non-numeric characters
    setYear(newYear);

    if (newYear.length !== 4) {
      setPopup("Please provide a valid year (four characters)");
    } else {
      setPopup("");
    }
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
    <div className="h-screen w-full p-2  flex justify-evenly items-center bg-indigomain">
      <div className="w-[100%] lg:w-[35%]">
        <div className="text-bgmain text-center mb-6 font-ubuntu font-medium text-3xl">
          Welcome back to Friendcity
        </div>

        <div className="items-center justify-center p-2 rounded-md bg-bgpost">
          <div className="my-2 justify-center flex gap-2">
            <img
              src="/girl.png"
              className="h-[15%] w-[15%]  rounded-full  bg-bgtwo"
            />
            <img
              src="/boy.png"
              className="h-[15%] w-[15%]  rounded-full  bg-bgtwo"
            />
            <img
              src="/people.png"
              className="h-[15%] w-[15%]  rounded-full  bg-bgtwo"
            />

            <img
              src="/girl2.png"
              className="h-[15%] w-[15%]  rounded-full  bg-bgtwo"
            />
            <img
              src="/boy2.png"
              className="h-[15%] w-[15%]  rounded-full  bg-bgtwo"
            />
          </div>

          <div>
            <div className="font-normal m-1 text-texttwo">Full Name</div>
            <input
              value={fullname}
              maxLength={20}
              onChange={(e) => {
                setFullName(e.target.value);
              }}
              className=" h-9 w-full text-textmain rounded-lg px-4 focus:outline-none bg-bordermain"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-texttwo">Username</div>
            <input
              value={username}
              maxLength={20}
              onChange={(e) => {
                handleUsernameChange(e.target.value);
              }}
              className={`w-full text-textmain h-9 px-4 bg-bordermain focus:outline-none  rounded-lg ${
                available ? "" : "border border-rosemain"
              }`}
              placeholder="Select your username"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-texttwo">Email</div>
            <input
              value={email}
              onChange={(e) => {
                handleEmailChange(e.target.value);
              }}
              className=" h-9 w-full text-textmain rounded-lg px-4 focus:outline-none bg-bordermain"
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-texttwo">Password</div>
            <input
              value={password}
              onChange={(e) => {
                handlePasswordChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              className=" h-9 w-full text-textmain rounded-lg px-4 focus:outline-none bg-bordermain"
              placeholder="Enter password"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-texttwo">Date of birth</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="Date"
                className="h-9 w-[25%] text-textmain rounded-lg px-4 focus:outline-none bg-bordermain border"
              />

              <input
                type="text"
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                placeholder="Month"
                className="h-9 w-[25%] text-textmain rounded-lg px-4 focus:outline-none bg-bordermain border"
              />

              <input
                type="text"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                placeholder="Year"
                className="h-9 w-[25%] text-textmain rounded-lg px-4 focus:outline-none bg-bordermain border"
              />
            </div>
          </div>

          <button
            onClick={signup}
            disabled={isLoading}
            className="my-4 w-full text-bgmain bg-indigomain active:bg-bgmain  focus:outline-none focus:ring-2 focus:ring-bordermain font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
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
          <div className="text-rosemain mt-2 font-ubuntu font-light text-center text-sm">
            {popup ? popup : ""}
          </div>
        </div>
      </div>
    </div>
  );
};
