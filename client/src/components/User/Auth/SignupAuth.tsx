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
  const handleEmailChnage = (text: string) => {
    const newEmail = text.toLowerCase();
    setEmail(newEmail);
  };
  const handlePasswordChnage = (text: string) => {
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

  async function signup() {
    setPopup("");
    if (!fullname || !username || !email || !password) {
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

    const userdata = { fullname, username, email, password };

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      signup();
    }
  };
  return (
    <>
      {isLoading && (
        <div className="h-screen flex justify-center items-center w-full">
          <CircularProgress />
        </div>
      )}
      {!isLoading && (
        <div className="h-screen w-full  bg-bgmain flex justify-center items-center">
          <div className="w-[80%] lg:w-[60%] md:w-[40%] grid gap-y-2">
            <div className="text-textmain font-ubuntu text-[1.5rem] text-center my-4">
              Create an account
            </div>

            <div>
              <div className="font-normal m-1 text-textmain">Name</div>
              <input
                value={fullname}
                maxLength={20}
                onChange={(e) => {
                  setFullName(e.target.value);
                }}
                className=" h-10 w-full rounded-lg px-4 focus:outline-none border border-neutral-300"
                placeholder="Enter your name"
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
                className={`w-full h-10 px-4 border border-neutral-300 focus:outline-none  rounded-lg ${
                  available ? "" : "border border-rosemain"
                }`}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <div className="font-normal m-1 text-textmain">Email</div>
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
              <div className="font-normal m-1 text-textmain">Password</div>
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
            <button
              onClick={signup}
              disabled={isLoading}
              className="my-4 w-full text-textmain bg-neutral-800 hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:ring-neutral-700 dark:border-neutral-700"
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
            <div className="text-rosemain font-ubuntu font-light text-center text-sm">
              {popup ? popup : <div>‎</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
