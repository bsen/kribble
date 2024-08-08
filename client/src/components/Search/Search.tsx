import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";
import { MenuBar } from "../Menu/MenuBar";
import { CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
interface User {
  username: string;
  image: string;
}

export const Search = () => {
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);

  const handleSearchingUsernameChange = (text: string) => {
    const searchingUsername = text.toLowerCase();
    setSearch(searchingUsername);
  };

  const fetchSearchResults = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/search/users`, {
        search,
      });
      setUsers(response.data.users);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setIsLoading(false);
    }
  }, [search]);

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  }

  const debouncedSearch = useCallback(debounce(fetchSearchResults, 1000), [
    fetchSearchResults,
  ]);

  useEffect(() => {
    if (search.length !== 0) {
      debouncedSearch();
    } else {
      setUsers([]);
    }
  }, [search, debouncedSearch]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col pb-16 h-screen bg-dark text-white"
    >
      <MenuBar />
      <div className="flex-grow overflow-auto p-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-6"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchingUsernameChange(e.target.value)}
              placeholder="Search users"
              className="w-full px-4 py-2.5 bg-semidark text-white border border-neutral-700 rounded-full focus:outline-none pl-12 transition-all duration-300"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </motion.div>
          {users.length > 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {users.map((user, index) => (
                <motion.div
                  key={user.username}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link to={`/${user.username}`} className="block">
                    <div className="flex items-center p-2.5 rounded-lg hover:bg-semidark transition-colors duration-300">
                      <img
                        src={user.image || "/user.png"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full mr-4 object-cover"
                      />
                      <span className="text-white font-medium">
                        {user.username}
                      </span>
                    </div>
                  </Link>
                  {index < users.length - 1 && <div className="mx-4"></div>}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-10"
            >
              {isLoading ? (
                <CircularProgress size={40} sx={{ color: "white" }} />
              ) : (
                <p className="text-neutral-400 text-lg">No users found</p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
