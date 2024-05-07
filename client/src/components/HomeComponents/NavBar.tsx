import { useEffect } from "react";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
export const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [userImage, setUserImage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  async function getUser() {
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/current-user`,
      { token }
    );

    setUserImage(response.data.image);
    setCurrentUser(response.data.data);
  }

  console.log(userImage, currentUser);
  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <div className="top-0 fixed w-full  lg:w-[45%]">
        <div className="w-full px-4 border-b border-neutral-200 bg-white h-14 flex justify-between items-center">
          <button
            onClick={() => {
              history.go(-1);
            }}
          >
            <div className="lg:hidden bg-gradient-to-r from-indigo-500 via-orange-500 to-indigo-500  text-transparent bg-clip-text text-3xl font-ubuntu">
              kribble
            </div>
          </button>

          <button
            disabled={false}
            className="h-10 mx-auto w-[50%] lg:w-[75%] flex px-4 justify-between items-center border border-neutral-100 bg-neutral-100 rounded-full"
            onClick={() => navigate("/search")}
          >
            <input
              type="text"
              disabled
              placeholder="Search"
              className="w-full h-full bg-neutral-100 focus:outline-none"
            />
            <SearchIcon className="text-neutral-600" />
          </button>

          <Link to={`/${currentUser}`}>
            <img
              src={userImage ? userImage : "/user.png"}
              alt="Profile"
              className="lg:hidden w-8 h-8 lg:h-10 lg:w-10 rounded-full"
            />
          </Link>
        </div>
      </div>
    </>
  );
};
