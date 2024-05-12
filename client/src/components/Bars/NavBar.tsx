import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [userImage, setUserImage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  async function getUser() {
    const response = await axios.post(`${BACKEND_URL}/api/user/auth/verify`, {
      token,
    });

    setUserImage(response.data.image);
    setCurrentUser(response.data.data);
  }

  useEffect(() => {
    getUser();
  }, []);
  return (
    <div className="top-0 rounded-b-md h-14 shadow-sm  bg-white/80 fixed w-full lg:w-[50%]">
      <div className="w-full h-full flex justify-between px-5 items-center">
        <button
          onClick={() => {
            navigate("/home");
          }}
        >
          <div className="lg:hidden bg-gradient-to-r from-indigo-500 to-orange-500  text-transparent bg-clip-text text-3xl font-ubuntu">
            kribble
          </div>
        </button>
        <button
          onClick={() => {
            navigate(`/${currentUser}`);
          }}
          className="flex gap-2 bg-indigo-100 px-2 py-1 rounded-lg items-center text-sm font-light text-indigo-600"
        >
          <img
            src={userImage ? userImage : "/user.png"}
            alt="Profile"
            className=" w-5 h-5  shadow-sm rounded-full"
          />
          Profile
        </button>
      </div>
    </div>
  );
};
