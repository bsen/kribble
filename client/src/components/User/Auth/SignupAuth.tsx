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
  "VIT Amaravati",
  "VIT Bhopal",
  "BITS Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "SRMIST Kattankulathur",
  "SRMIST Amaravati",
  "SRMIST NCR",
  "MIT Manipal",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT Guwahati",
  "NIT Trichy",
  "NIT Surathkal",
  "NIT Warangal",
  "NIT Calicut",
  "NIT Rourkela",
  "NIT Kurukshetra",
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

    if (!isEighteen()) {
      setPopup("You must be at least 18 years old to register");
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
    <div className="h-screen w-full p-2  flex justify-evenly items-center bg-indigo-600">
      <div className="w-[100%] lg:w-[35%]">
        <div className="text-texttwo text-center mb-6 font-ubuntu font-medium text-3xl">
          Create your account in FriendCity
        </div>

        <div className="items-center justify-center p-2 rounded-md bg-bgmain">
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
            <div className="text-texttwo text-sm font-light">College</div>
            <FormControl className="w-full">
              <Select
                sx={{
                  boxShadow: "none",
                  ".MuiOutlinedInput-notchedOutline": { border: 0 },
                }}
                className="h-9 w-full text-texttwo rounded-lg focus:outline-none bg-bordermain"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      width: 250,
                      overflow: "auto",
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
            <div className="font-normal m-1 text-texttwo">Date of birth</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="Date"
                className="h-9 w-[25%] text-textmain rounded-lg px-4 focus:outline-none bg-bordermain"
              />

              <input
                type="text"
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                placeholder="Month"
                className="h-9 w-[25%] text-textmain rounded-lg px-4 focus:outline-none bg-bordermain"
              />

              <input
                type="text"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                placeholder="Year"
                className="h-9 w-[25%] text-textmain rounded-lg px-4 focus:outline-none bg-bordermain"
              />
            </div>
          </div>
          <button
            onClick={signup}
            disabled={isLoading}
            className="my-4 w-full text-texttwo bg-indigomain active:bg-bgmain  focus:outline-none focus:ring-2 focus:ring-bordermain font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Register
          </button>
          <div className="text-center text-md font-light text-textmain">
            Already have an account?
            <Link
              to="/login"
              className="font-normal text-textmain underline underline-offset-2 mx-1"
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
