import React, { useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { UserContext } from "../User/Context/UserContext";

interface MenuButtonProps {
  to: string;
  icon: ReactNode;
}

const MenuButton: React.FC<MenuButtonProps> = ({ to, icon }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <button
      onClick={() => navigate(to)}
      className={`py-2 px-4 rounded-lg opacity-90 ${
        location.pathname === to
          ? "text-white bg-semidark"
          : "text-semilight hover:bg-semidark hover:text-white"
      }`}
    >
      {icon}
    </button>
  );
};

export const MenuBar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { currentUser, isLoading } = useContext(UserContext);
  const [newNotification, setNewNotification] = useState<boolean>(false);

  const checkUnreadNotification = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/user/notifications/unread`,
        { token }
      );
      if (response.data.status === 200) {
        setNewNotification(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) checkUnreadNotification();
  }, [token]);

  return (
    <>
      {location.pathname === "/" && (
        <div
          className="fixed top-0 left-0 bg-dark/60 py-0.5 px-6 rounded-br-lg"
          style={{ zIndex: "100" }}
        >
          <div
            onClick={() => navigate("/")}
            className="text-white text-xl font-ubuntu font-medium cursor-pointer"
          >
            Kribble
          </div>
        </div>
      )}
      <div
        style={{ zIndex: 100 }}
        className="h-14 w-full fixed bottom-0 bg-dark/60 backdrop-filter backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-4 h-full flex justify-evenly items-center">
          <MenuButton
            to="/"
            icon={<img src="/home.png" className="h-6 w-6" />}
          />
          <MenuButton
            to="/search"
            icon={<img src="/search.png" className="h-6 w-6" />}
          />
          <MenuButton
            to="/post"
            icon={<img src="/add.png" className="h-6 w-6" />}
          />
          {token && (
            <MenuButton
              to="/notifs"
              icon={
                <div className="relative">
                  {newNotification && (
                    <span className="absolute -right-0.5 top-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rosemain opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rosemain"></span>
                    </span>
                  )}
                  <img src="/like.png" className="h-6 w-6" />
                </div>
              }
            />
          )}
          <button
            onClick={() =>
              !isLoading && currentUser && navigate(`/${currentUser}`)
            }
            disabled={isLoading || !currentUser}
            className={`py-2 px-4 rounded-lg opacity-90 text-semilight hover:bg-semidark hover:text-white`}
          >
            <img src="/user.png" className="h-6 w-6" />
          </button>
        </div>
      </div>
    </>
  );
};
