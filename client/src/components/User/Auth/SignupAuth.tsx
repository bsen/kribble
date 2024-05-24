import { useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { UserContext } from "../Context/UserContext";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
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

const colleges = [
  "VIT Vellore",
  "VIT Chennai",
  "VIT Bhopal",
  "BITS Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "SRMIST",
  "MIT Manipal",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "NIT Trichy",
  "NIT Surathkal",
  "NIT Durgapur",
  "NSUT",
  "DTU",
  "IGDTUW",
  "Other",
];

export const SignupAuth = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [available, setAvailable] = useState<boolean>(true);
  const [fullname, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [college, setCollege] = useState<string>("");
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
  const handleCollegeChange = (event: SelectChangeEvent) => {
    setCollege(event.target.value as string);
  };

  const handleDateChange = (text: string) => {
    const newDate = text.replace(/\D/g, "");
    setDate(newDate);

    if (newDate.length !== 2) {
      setPopup("Please provide a valid date (two characters)");
    } else {
      setPopup("");
    }
  };

  const handleMonthChange = (text: string) => {
    const newMonth = text.replace(/\D/g, "");
    setMonth(newMonth);

    if (newMonth.length !== 2) {
      setPopup("Please provide a valid month (two characters)");
    } else {
      setPopup("");
    }
  };

  const handleYearChange = (text: string) => {
    const newYear = text.replace(/\D/g, "");
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
      !college ||
      !password ||
      !year ||
      !month ||
      !date
    ) {
      setPopup("All the fields are necessary");
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

    if (!isThirteen()) {
      setPopup("You must be at least 13 years old to register");
      return;
    }

    const userdata = {
      fullname,
      username,
      email,
      password,
      college,
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

  const isThirteen = () => {
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
    return age >= 13;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center w-full">
        <CircularProgress />
      </div>
    );
  }
  return (
    <div className="lg:flex justify-between items-center">
      <div className="h-screen p-3 flex justify-center items-center w-full bg-indigomain">
        <div className="text-semilight text-center mb-4 font-ubuntu font-medium text-[2.5rem]">
          FriendCity
          <div className="text-center text-sm font-thin mb-8 text-light">
            A place where college life meets limitless fun! 🎉 Share your
            moments, snap cool pics, and dive into vibrant communities. With our
            anonymous posting, let your thoughts soar freely. But wait, there's
            more! Join forces with a fellow student, conquer exciting
            challenges, and skyrocket to the top of the leaderboard! 🚀 Get
            ready to unleash the epicness, starting at the top 20 colleges.
            Don't miss out on the adventure – join us now!
          </div>
          <div className="flex flex-wrap mb-5 justify-center gap-2">
            <img
              src="/girl.png"
              className="h-[15%] w-[15%] rounded-full bg-semidark"
              alt="Girl"
            />
            <img
              src="/boy.png"
              className="h-[15%] w-[15%] rounded-full bg-semidark"
              alt="Boy"
            />
            <img
              src="/people.png"
              className="h-[15%] w-[15%] rounded-full bg-semidark"
              alt="People"
            />
            <img
              src="/girl2.png"
              className="h-[15%] w-[15%] rounded-full bg-semidark"
              alt="Girl 2"
            />
            <img
              src="/boy2.png"
              className="h-[15%] w-[15%] rounded-full bg-semidark"
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
            className="lg:hidden rounded-full bg-white text-indigomain px-4 py-1 text-lg"
          >
            Join now
          </button>
        </div>
      </div>
      <div className="flex flex-col h-screen bg-dark justify-center items-center p-3 w-full">
        <div className="items-center p-2 rounded-lg bg-semidark w-[80%] lg:w-[50%]">
          <div>
            <div className="font-normal m-1 text-semilight">Full Name</div>
            <input
              value={fullname}
              maxLength={20}
              onChange={(e) => {
                setFullName(e.target.value);
              }}
              className=" h-9 w-full text-light rounded-lg px-4 focus:outline-none bg-dark"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-semilight">Username</div>
            <input
              value={username}
              maxLength={20}
              onChange={(e) => {
                handleUsernameChange(e.target.value);
              }}
              className={`w-full text-light h-9 px-4 bg-dark focus:outline-none  rounded-lg ${
                available ? "" : "border border-rosemain"
              }`}
              placeholder="Select your username"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-semilight">Email</div>
            <input
              value={email}
              onChange={(e) => {
                handleEmailChange(e.target.value);
              }}
              className=" h-9 w-full text-light rounded-lg px-4 focus:outline-none bg-dark"
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <div className="font-normal m-1 text-semilight">Password</div>
            <input
              value={password}
              onChange={(e) => {
                handlePasswordChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              className=" h-9 w-full text-light rounded-lg px-4 focus:outline-none bg-dark"
              placeholder="Enter password"
            />
          </div>

          <div>
            <div className="font-normal m-1 text-semilight">College</div>
            <FormControl className="w-full">
              <Select
                sx={{
                  boxShadow: "none",
                  color: "rgb(210 210 210);",
                  ".MuiOutlinedInput-notchedOutline": { border: 0 },
                }}
                className="h-9 w-full text-semilight rounded-lg focus:outline-none bg-dark"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      width: 250,
                      overflow: "auto",
                      backgroundColor: "rgb(18 18 18)",
                      color: "rgb(210 210 210)",
                    },
                  },
                  disableScrollLock: true,
                  disablePortal: true,
                }}
                onChange={handleCollegeChange}
                value={college}
              >
                <MenuItem value="" disabled>
                  Select Campus
                </MenuItem>
                {colleges.map((college) => (
                  <MenuItem key={college} value={college}>
                    {college}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div>
            <div className="font-normal m-1 text-semilight">Date of birth</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="Date"
                className="h-9 w-[25%] text-light rounded-lg px-4 focus:outline-none bg-dark"
              />

              <input
                type="text"
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                placeholder="Month"
                className="h-9 w-[25%] text-light rounded-lg px-4 focus:outline-none bg-dark"
              />

              <input
                type="text"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                placeholder="Year"
                className="h-9 w-[25%] text-light rounded-lg px-4 focus:outline-none bg-dark"
              />
            </div>
          </div>
          <button
            onClick={signup}
            disabled={isLoading}
            className="my-4 w-full text-semilight bg-indigomain active:bg-dark  focus:outline-none focus:ring-2 focus:ring-dark font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Register
          </button>
          <div className="text-center text-md font-light text-light">
            Already have an account?
            <Link
              to="/login"
              className="font-normal text-light underline underline-offset-4 mx-1"
            >
              Login
            </Link>
          </div>
        </div>
        <div className="text-rosemain mt-2 font-light text-center text-xs">
          {popup ? popup : <div>‎</div>}
        </div>
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
