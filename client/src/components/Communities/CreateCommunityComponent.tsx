import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../config";
import { Loading } from "../Loading";
import CloseIcon from "@mui/icons-material/Close";
export const CreateCommunityComponent = () => {
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState(false);
  const [popup, setPopup] = useState("");
  const [available, setAvailable] = useState(true);
  const [name, setName] = useState("");
  const [catagory, setCatagory] = useState("");
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
      `${BACKEND_URL}/api/server/v1/community/community-name-check`,
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
    if (!catagory) {
      return setPopup("Select a valid catagory");
    }
    if (!description) {
      return setPopup("Enter a valid description");
    }
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/community/create-community`,
        { token, name, description, catagory }
      );
      setLoadingState(false);
      setPopup(response.data.message);
      if (response.data.status == 200) {
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
        <div className="h-screen flex justify-center items-center px-5 lg:px-0">
          <div className="w-full max-w-md my-5 rounded-lg bg-background">
            <div className="text-lg my-5 flex justify-center items-center gap-5 font-ubuntu font-medium text-center">
              <div>
                <button onClick={handleClose}>
                  <CloseIcon
                    className="bg-neutral-800 p-1 rounded-full text-white"
                    sx={{ fontSize: 30 }}
                  />
                </button>
              </div>
              <div>Create Community</div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Community Name
                </div>
                <input
                  value={name}
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                  }}
                  className={`w-full border border-neutral-200 resize-none focus:outline-none p-2 text-primarytextcolor rounded-lg ${
                    available ? "" : "border border-rose-500"
                  }`}
                  placeholder="Choose a name for your community"
                  maxLength={20}
                />
              </div>
              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Catagory
                </div>
                <select
                  value={catagory}
                  onChange={(e) => {
                    setCatagory(e.target.value);
                  }}
                  className="h-10 w-full rounded-lg px-2 text-secondarytextcolor border border-neutral-200 appearance-none"
                >
                  <option value="" className="text-secondarytextcolor">
                    Select your catagoty
                  </option>
                  <option value="Outdoor Activities">Outdoor Activities</option>
                  <option value="Healthy Living">Healthy Living</option>

                  <option value="Art & Creativity">Art & Creativity</option>
                  <option value="Music & Dance">Music & Dance</option>
                  <option value="Technology & Innovation">
                    Technology & Innovation
                  </option>
                  <option value="Coding & Development">
                    Coding & Development
                  </option>
                  <option value="Film & Cinema">Film & Cinema</option>
                  <option value="Literature & Writing">
                    Literature & Writing
                  </option>
                  <option value="Travel & Adventure">Travel & Adventure</option>
                  <option value="Environmental Conservation">
                    Environmental Conservation
                  </option>
                  <option value="History & Archaeology">
                    History & Archaeology
                  </option>
                  <option value="Fashion & Design">Fashion & Design</option>
                  <option value="Gaming & eSports">Gaming & eSports</option>
                  <option value="Photography & Visual Arts">
                    Photography & Visual Arts
                  </option>
                  <option value="Science & Exploration">
                    Science & Exploration
                  </option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <div className="font-semibold m-1 text-primarytextcolor">
                  Description
                </div>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  className="w-full border border-neutral-200 resize-none focus:outline-none px-2 py-1 text-primarytextcolor rounded-lg"
                  placeholder="Write description for your community"
                  maxLength={150}
                />
              </div>
              <div className="flex w-full justify-center">
                <button
                  onClick={createCommunity}
                  className="bg-black w-full active:bg-neutral-700 hover:bg-neutral-900 text-white border border-neutral-200 px-6 py-2 rounded-lg"
                >
                  Create your community
                </button>
              </div>
              <div className="text-red-400 font-ubuntu font-light text-center text-sm my-2">
                {popup ? popup : "‎"}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
