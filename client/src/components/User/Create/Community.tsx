import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { NavBar } from "../../Bars/NavBar";
import { CircularProgress } from "@mui/material";

export const Community = () => {
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
  async function checkName() {
    const response = await axios.post(
      `${BACKEND_URL}/api/community/create/name/check`,
      { name }
    );
    if (response.data.status === 101) {
      setPopup("This community name is already taken");
      return setAvailable(false);
    }
    if (response.data.status === 102) {
      setPopup("");
      return setAvailable(true);
    }
  }
  useEffect(() => {
    setPopup("");
    setTimeout(() => {
      checkName();
    }, 1000);
  }, [name]);

  async function createCommunity() {
    if (available == false) {
      return setPopup("This community name is already taken");
    }
    if (!name) {
      return setPopup("Enter a valid name");
    }

    if (!description) {
      return setPopup("Enter a valid description");
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/create/create`,
        { token, name, description }
      );
      setIsLoading(false);
      setPopup(response.data.message);
      if (response.data.status == 100) {
        history.go(-1);
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
      <div className="w-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex justify-center items-center px-5 lg:px-0">
        <NavBar />
        <div className="w-full max-w-md my-5 p-3 rounded-lg bg-dark">
          <div className="text-lg my-5 flex justify-center items-center gap-5 font-ubuntu font-medium text-center">
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
              <div className="font-normal m-1 text-light">Community Name</div>
              <input
                value={name}
                onChange={(e) => {
                  handleNameChange(e.target.value);
                }}
                className={`w-full border border-semidark resize-none focus:outline-none p-2 text-semilight rounded-lg ${
                  available ? "" : "border border-rosemain"
                }`}
                placeholder="Choose a name for your community"
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
                className="w-full border border-semidark resize-none focus:outline-none px-2 py-1 text-semilight rounded-lg"
                placeholder="Write description for your community"
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
