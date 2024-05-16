import axios from "axios";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { BottomBar } from "../Bars/BottomBar";

interface User {
  username: string;
  name: string;
  image: string;
}

interface Community {
  name: string;
  image: string;
}

export const SearchComponent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  async function SearchText() {
    setIsSearching(true);
    const response = await axios.post(`${BACKEND_URL}/api/search/data`, {
      token,
      search,
    });
    setIsSearching(false);
    setUsers(response.data.users);
    setCommunities(response.data.communities);
  }

  useEffect(() => {
    if (search.length !== 0) {
      setIsSearching(true);
      setTimeout(() => {
        SearchText();
      }, 1000);
    }
  }, [search]);

  return (
    <div className="top-0 fixed w-full  lg:w-[45%]">
      <div className="w-full px-4 border-b border-bordermain bg-bgmain h-14 flex justify-between items-center">
        <button
          disabled={true}
          className="h-10 mx-auto w-[75%] flex px-4 justify-between items-center border border-bordermain bg-neutral-100 rounded-full"
          onClick={() => navigate("/search")}
        >
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full h-full bg-neutral-100 focus:outline-none"
          />
          <SearchIcon className="text-texttwo" />
        </button>
      </div>

      <div>
        {users.length !== 0 || communities.length !== 0 ? (
          <div>
            <div className="bg-bgmain">
              {users.map((user) => (
                <Link to={`/${user.username}`} key={user.username}>
                  <div className="flex border my-2 bg-bgmain rounded-md border-bordermain py-2 gap-2 items-center px-4 hover:bg-neutral-100">
                    <div className=" text-sm font-normal text-textmain">u/</div>
                    <div>
                      <img
                        src={user.image ? user.image : "/user.png"}
                        alt="Profile"
                        className="h-8 w-8 rounded-full"
                      />
                    </div>

                    <div className="text-textmain text-base  font-normal">
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
                  <div className="flex border my-2 bg-bgmain rounded-md border-bordermain py-2 gap-2 items-center px-4 hover:bg-neutral-100">
                    <div className=" text-sm font-normal text-textmain">c/</div>
                    <div>
                      <img
                        src={community.image ? community.image : "/group.png"}
                        alt="Profile"
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                    <div className="items-center">
                      <div className="text-textmain text-base  font-normal">
                        {community.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {isSearching ? (
              <div className="text-texttwo my-5  font-light text-center text-lg">
                Searching
              </div>
            ) : (
              <div className="text-texttwo my-5  font-light text-center text-lg">
                Search result not found
              </div>
            )}
          </div>
        )}
      </div>
      <BottomBar />
    </div>
  );
};
