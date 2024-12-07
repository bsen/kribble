import React, { useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { UserContext } from "../User/Context/UserContext";
import { Home, Tv, Users, Search, User, Plus } from "lucide-react";

export const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useContext(UserContext);

  const NavButton = ({
    path,
    icon,
    label,
  }: {
    path: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`w-full h-12 px-4 rounded-xl flex items-center gap-3 transition-colors
          ${
            isActive
              ? "bg-indigo-600 text-white font-medium"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          }`}
      >
        {icon}
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border border-neutral-800 rounded-xl p-4 shadow-lg">
        <div className="space-y-2">
          <NavButton path="/" icon={<Home size={20} />} label="Home" />
          <NavButton
            path="/search"
            icon={<Search size={20} />}
            label="Search"
          />
          <NavButton
            path={`/${currentUser}`}
            icon={<User size={20} />}
            label="Profile"
          />

          <button
            onClick={() => navigate("/create")}
            className="w-full h-12 mt-4 px-4 bg-indigo-600 hover:bg-indigo-700 
              rounded-xl text-white font-medium flex items-center gap-3 
              transition-colors"
          >
            <Plus size={20} />
            <span className="text-sm">Create Post</span>
          </button>
        </div>
      </div>
      <footer className="mt-4 text-center text-xs text-neutral-500 space-y-2">
        <p>© 2024 friendcity</p>
        <p>A product by Algabay Private Limited</p>
        <Link to="/policies" className="hover:text-neutral-400 underline">
          Policies
        </Link>
      </footer>
    </div>
  );
};
