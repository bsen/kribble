import axios from "axios";
import { useState, useEffect } from "react";

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
  const [users, setUsers] = useState<User[]>([]); // Explicitly set the type to User[]
  const [communities, setCommunities] = useState<Community[]>([]); // Explicitly set the type to Community[]

  async function SearchText() {
    console.log(search);
    const response = await axios.post(
      `http://localhost:8787/api/server/v1/search`,
      { token, search }
    );
    setUsers(response.data.users);
    setCommunities(response.data.communities);
  }

  useEffect(() => {
    if (search.length !== 0) {
      setSearchingState(true);
      SearchText();
    } else {
      setSearchingState(false);
    }
  }, [search]);

  return (
    <>
      <div className="w-full h-16 border-b border-neutral-200 flex justify-center items-center">
        <input
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          className="bg-neutral-100 rounded-full h-10 w-[80%] focus:outline-none px-4"
        />
      </div>
      {searchingState && (
        <div className="h-[40vh] z-100  flex justify-center">
          <div className="w-[90%] p-4 shadow-md border-b border-r border-l rounded-b-xl border-neutral-200">
            <h2>Users</h2>
            <ul>
              {users.map((user) => (
                <li key={user.username}>
                  <p>{user.username}</p>
                  <p>{user.name}</p>
                  <img
                    src={user.image ? user.image : "user.png"}
                    alt={user.username}
                    className="h-8 w-8"
                  />
                </li>
              ))}
            </ul>
            <h2>Communities</h2>
            <ul>
              {communities.map((community) => (
                <li key={community.name}>
                  <p>{community.name}</p>
                  <img src={community.image} alt={community.name} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
