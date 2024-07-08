import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { NavBar } from "../../Bars/NavBar";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
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

export const Community = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState("");
  const [available, setAvailable] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const validateUsername = (char: string) => {
    return char.match(/^[a-z0-9_]$/i);
  };
  const handleNameChange = (text: string) => {
    const newName = text
      .split("")
      .filter(validateUsername)
      .join("")
      .toLowerCase();
    setName(newName);
  };

  const checkName = async (name: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/community/create/name/check`,
        { name }
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
    debouncedCheckName(name);
    return () => debouncedCheckName.cancel();
  }, [name]);

  async function createCommunity() {
    if (available == false) {
      return setPopup("This community name is already taken");
    }
    if (!name) {
      return setPopup("Write a name");
    }

    if (!description) {
      return setPopup("Write some description");
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/create/create`,
        { token, name, description }
      );
      setIsLoading(false);
      setPopup(response.data.message);
      if (response.data.status == 200) {
        navigate(`/community/${name}`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleClose = () => {
    history.go(-1);
  };
  if (isLoading) {
    return (
      <div className="w-full my-5 flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="flex justify-center h-screen overflow-y-auto no-scrollbar py-14">
        <div className="w-full md:w-[35%] px-2">
          <div className="text-lg my-3 flex justify-center items-center gap-5 font-ubuntu font-medium text-center">
            <div>
              <button onClick={handleClose}>
                <ArrowBackIcon
                  className="rounded-full text-light"
                  sx={{ fontSize: 30 }}
                />
              </button>
            </div>
            <div className="text-light">Create Community</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-normal m-1 text-light">Name</div>
              <input
                value={name}
                onChange={(e) => {
                  handleNameChange(e.target.value);
                }}
                className={`w-full h-9 overflow-auto no-scrollbar resize-none hover:bg-semidark focus:outline-none px-2 py-1 rounded-lg ${
                  available ? "" : "border border-rosemain"
                } bg-semidark text-semilight`}
                placeholder="Write a name"
                maxLength={20}
              />
            </div>
            <div>
              <div className="m-1 text-light font-normal">Description</div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                className="w-full bg-semidark overflow-auto no-scrollbar resize-none hover:bg-semidark focus:outline-none px-2 py-1 text-semilight rounded-lg"
                placeholder="Write a description"
                maxLength={150}
              />
            </div>
            <div className="flex w-full justify-center">
              <button
                onClick={createCommunity}
                className="bg-indigomain w-full text-semilight px-6 py-2 rounded-lg"
              >
                Create your community
              </button>
            </div>
            <div className="text-red-400 font-ubuntu font-light text-center text-sm my-2">
              {popup ? popup : <div>‎</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
