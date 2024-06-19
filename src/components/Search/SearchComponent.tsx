import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { BottomBar } from "../Bars/BottomBar";
import LinearProgress from "@mui/material/LinearProgress";
import { NavBar } from "../Bars/NavBar";
import { CircularProgress } from "@mui/material";

interface User {
  username: string;
  image: string;
}

export const SearchComponent = () => {
  const [search, setSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);

  const fetchSearchResults = useCallback(async () => {
    setIsSearching(true);
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
    } finally {
      setIsSearching(false);
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
    <>
      <div className="h-screen overflow-y-auto no-scrollbar py-12">
        <NavBar />
        {isSearching && <LinearProgress sx={{ backgroundColor: "black" }} />}

        <div className="w-full h-14 flex justify-between items-center">
          <div className="h-10 bg-dark mx-auto w-full hover:bg-semidark flex px-4 justify-between items-center border border-semidark rounded-lg">
            <input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users"
              className="w-full h-full bg-dark hover:bg-semidark text-semilight focus:outline-none"
            />
            <SearchIcon className="text-semilight" />
          </div>
        </div>

        {users.length > 0 ? (
          users.map((user, index) => (
            <div
              key={index}
              className="mb-2 p-2 rounded-lg border border-semidark bg-dark"
            >
              <Link to={`/${user.username}`}>
                <div className="flex justify-between gap-2">
                  <div className="flex gap-2">
                    <img
                      className="h-7 w-7 rounded-lg bg-dark"
                      src={user.image ? user.image : "/user.png"}
                      alt={user.username}
                    />
                    <div className="flex flex-col w-full">
                      <div className="text-light text-base font-normal font-ubuntu">
                        {user.username}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div>
            {isLoading ? (
              <div className="w-full my-5 flex justify-center items-center">
                <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
              </div>
            ) : (
              <div className="text-semilight my-5 font-light text-center text-sm">
                Search result not found
              </div>
            )}
          </div>
        )}

        <BottomBar />
      </div>
    </>
  );
};
