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
  const [searchingState, setSearchingState] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const modal = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState(false);
  async function SearchText() {
    const response = await axios.post(`${BACKEND_URL}/api/server/v1/search`, {
      token,
      search,
    });
    setUsers(response.data.users);
    setCommunities(response.data.communities);
  }

  const closeModal = (e: MouseEvent) => {
    if (
      searchingState ||
      (dropdown && modal.current && !modal.current.contains(e.target as Node))
    ) {
      setSearchingState(false);
      setDropdown(false);
    }
  };
  document.addEventListener("mousedown", closeModal);

  useEffect(() => {
    if (search.length !== 0) {
      setSearchingState(true);
      setDropdown(false);
      SearchText();
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
                <div className="w-[90%] bg-white px-4 shadow-md  rounded-b-xl ovverflow-y-auto no-scrollbar">
                  {users.length !== 0 || communities.length !== 0 ? (
                    <div>
                      <div>
                        {users.map((user) => (
                          <div key={user.username}>
                            <div className="flex gap-2 items-center my-2">
                              <div className=" text-sm font-ubuntu font-semibold text-secondarytextcolor">
                                U/
                              </div>
                              <div>
                                <Link to={`/${user.username}`}>
                                  <img
                                    src={user.image ? user.image : "/user.png"}
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full"
                                  />
                                </Link>
                              </div>

                              <Link to={`/${user.username}`}>
                                <div className="text-primarytextcolor text-lg hover:underline font-semibold">
                                  {user.name}
                                </div>
                              </Link>
                              <Link to={`/${user.username}`}>
                                <div className="text-secondarytextcolor hover:underline text-xs lg:text-sm font-ubuntu">
                                  @{user.username}
                                </div>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        {communities.map((community) => (
                          <div key={community.name}>
                            <div className="flex gap-2 items-center">
                              <div className=" text-sm font-ubuntu font-semibold text-black">
                                C/
                              </div>
                              <div>
                                <Link to={`/${community.name}`}>
                                  <img
                                    src={
                                      community.image
                                        ? community.image
                                        : "/group.png"
                                    }
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full"
                                  />
                                </Link>
                              </div>
                              <div className="items-center">
                                <Link to={`/${community.name}`}>
                                  <div className="text-primarytextcolor text-lg hover:underline font-semibold">
                                    {community.name}
                                  </div>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>{" "}
                    </div>
                  ) : (
                    <div className="text-sm my-4 font-ubuntu font-medium text-center text-secondarytextcolor">
                      Search result not found
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
