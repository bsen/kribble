import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import { DropDown } from "../Mobile/DropDown";
interface User {
  username: string;
  name: string;
  image: string;
}

interface Community {
  name: string;
  image: string;
}

export const SearchBox = () => {
  const token = localStorage.getItem("token");
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchingState, setSearchingState] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const modal = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState(false);
  async function SearchText() {
    setIsSearching(true);
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/search/search-all`,
      {
        token,
        search,
      }
    );
    setIsSearching(false);
    setUsers(response.data.users);
    setCommunities(response.data.communities);
  }
  const closeModal = (e: MouseEvent) => {
    if (
      searchingState ||
      (dropdown &&
        modal.current &&
        !modal.current.contains(e.target as Node) &&
        !(e.target instanceof Node && modal.current.contains(e.target)))
    ) {
      setSearchingState(false);
      setDropdown(false);
    }
  };

  document.addEventListener("mousedown", closeModal);

  useEffect(() => {
    if (search.length !== 0) {
      setIsSearching(true);
      setSearchingState(true);
      setDropdown(false);
      setTimeout(() => {
        SearchText();
      }, 1000);
    } else {
      setSearchingState(false);
    }
  }, [search]);

  return (
    <>
      <div className="top-0 fixed w-full  lg:w-[45%]" ref={modal}>
        <div className="w-full border-b border-neutral-200 bg-white h-14 flex justify-evenly items-center">
          <button
            onClick={() => {
              history.go(-1);
            }}
          >
            <div className="lg:hidden bg-gradient-to-r from-violet-500 via-orange-500 to-indigo-500  text-transparent bg-clip-text text-3xl font-ubuntu">
              Kr
            </div>
          </button>
          <div className="flex px-4 justify-between items-center border border-neutral-100 bg-neutral-100 rounded-full h-10 w-[70%]">
            <input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full h-full bg-neutral-100 focus:outline-none"
            />
            <SearchIcon />
          </div>
          <button
            onClick={() => {
              setDropdown(!dropdown);
            }}
            className="lg:hidden text-primarytextcolor"
          >
            <DensityMediumIcon />
          </button>
        </div>
        {dropdown ? (
          <div className="absolute lg:hidden flex flex-col items-start p-4 rounded-b-xl border-l border-b border-neutral-50 bg-white shadow-sm right-0 top-14">
            <DropDown />
          </div>
        ) : (
          <div>
            {searchingState && (
              <div className="h-auto z-100  flex justify-center">
                <div className="w-[90%] bg-white  shadow-md  rounded-b-xl ovverflow-y-auto no-scrollbar">
                  {users.length !== 0 || communities.length !== 0 ? (
                    <div>
                      <div>
                        {users.map((user) => (
                          <Link to={`/${user.username}`} key={user.username}>
                            <div className="flex gap-2 py-2 items-center px-4 hover:bg-neutral-50 border-b border-neutral-100">
                              <div className=" text-sm font-medium text-primarytextcolor">
                                u/
                              </div>
                              <div>
                                <img
                                  src={user.image ? user.image : "/user.png"}
                                  alt="Profile"
                                  className="h-8 w-8 rounded-full"
                                />
                              </div>

                              <div className="text-primarytextcolor text-lg  font-semibold">
                                {user.name}
                              </div>

                              <div className="text-secondarytextcolor  text-xs lg:text-sm font-ubuntu">
                                @{user.username}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div>
                        {communities.map((community) => (
                          <Link to={`/${community.name}`} key={community.name}>
                            <div className="flex py-2 gap-2 items-center px-4 hover:bg-neutral-50">
                              <div className=" text-sm font-medium text-primarytextcolor">
                                c/
                              </div>
                              <div>
                                <img
                                  src={
                                    community.image
                                      ? community.image
                                      : "/group.png"
                                  }
                                  alt="Profile"
                                  className="h-8 w-8 rounded-full"
                                />
                              </div>
                              <div className="items-center">
                                <div className="text-primarytextcolor text-lg  font-semibold">
                                  {community.name}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>{" "}
                    </div>
                  ) : (
                    <div>
                      {isSearching ? (
                        <div className="text-sm my-4 font-ubuntu font-normal text-center text-secondarytextcolor">
                          Searching
                        </div>
                      ) : (
                        <div className="text-sm my-4 font-ubuntu font-normal text-center text-secondarytextcolor">
                          Search result not found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
