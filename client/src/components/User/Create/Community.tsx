import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";
import { Loading } from "../../Loading";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { NavBar } from "../../Bars/NavBar";

export const Community = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
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
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/community/create/create`,
        { token, name, description }
      );
      setLoadingState(false);
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

  return (
    <>
      {loadingState ? (
        <Loading />
      ) : (
        <div className="h-screen border-l border-r border-neutral-100 bg-white flex justify-center items-center px-5 lg:px-0">
          <NavBar />
          <div className="w-full max-w-md my-5 rounded-lg bg-white">
            <div className="text-lg my-5 flex justify-center items-center gap-5 font-ubuntu font-medium text-center">
              <div>
                <button onClick={handleClose}>
                  <ArrowBackIcon
                    className="bg-neutral-800 p-1 rounded-full text-white"
                    sx={{ fontSize: 30 }}
                  />
                </button>
              </div>
              <div>Create Community</div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div className="font-normal m-1 text-neutral-800">
                  Community Name
                </div>
                <input
                  value={name}
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                  }}
                  className={`w-full border border-neutral-100 resize-none focus:outline-none p-2 text-neutral-600 rounded-lg ${
                    available ? "" : "border border-rose-500"
                  }`}
                  placeholder="Choose a name for your community"
                  maxLength={20}
                />
              </div>
              <div>
                <div className="m-1 text-neutral-800 font-normal">
                  Description
                </div>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  className="w-full border border-neutral-100 resize-none focus:outline-none px-2 py-1 text-neutral-600 rounded-lg"
                  placeholder="Write description for your community"
                  maxLength={150}
                />
              </div>
              <div className="flex w-full justify-center">
                <button
                  onClick={createCommunity}
                  className="bg-indigo-500 w-full text-white px-6 py-2 rounded-lg"
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
      )}
    </>
  );
};
