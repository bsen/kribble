import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";
import { MenuBar } from "../Menu/MenuBar";
import { CircularProgress } from "@mui/material";

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
    <div className="flex flex-col h-[calc(100vh-56px)] bg-black">
      <MenuBar />
      <div className="flex-grow overflow-auto py-4 scrollbar-hide">
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchingUsernameChange(e.target.value)}
              placeholder="Search users"
              className="w-full px-4 py-2 bg-[#101010] text-white border border-[#262626] rounded-md focus:outline-none focus:border-[#474747] pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white"
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
          </div>

          {users.length > 0 ? (
            <div>
              {users.map((user, index) => (
                <div key={user.username}>
                  <Link to={`/${user.username}`} className="block">
                    <div className="flex items-center p-2">
                      <img
                        src={user.image || "/user.png"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full mr-4"
                      />
                      <span className="text-white">{user.username}</span>
                    </div>
                  </Link>
                  {index < users.length - 1 && (
                    <div className="border-b border-[#262626]"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-4">
              {isLoading ? (
                <CircularProgress sx={{ color: "white" }} />
              ) : (
                <p className="text-[#8e8e8e]">Search result not found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
