import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../config";

interface Community {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  image: string;
}

interface Suggestions {
  suggestedCommunities: Community[];
  suggestedUsers: User[];
  nextCursor: string | null;
}

export const Suggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestions>({
    suggestedCommunities: [],
    suggestedUsers: [],
    nextCursor: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${BACKEND_URL}/api/server/v1/community/user-suggestions`,
          { token }
        );
        setSuggestions(response.data);
      } catch (err: any) {
        setError(err.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      className="h-screen overflow-y-auto no-scrollbar border-l border-neutral-200"
      onScroll={handleScroll}
    >
      <div className="text-secondarytextcolor  w-full h-14 text-center flex justify-center items-center  text-lg font-ubuntu mb-4">
        <div className="border-b border-neutral-200 h-14 flex justify-center items-center w-[50%]">
          Suggestions
        </div>
      </div>
      {loading ? (
        <div className="text-center my-5">
          <CircularProgress />
        </div>
      ) : (
        <div>
          <div>
            {suggestions.suggestedCommunities.length > 0
              ? suggestions.suggestedCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="border-b  border-neutral-200 p-3 bg-green-600 w-[70%]"
                  >
                    <div className="flex justify-start items-center bg-red-200 gap-2">
                      <img
                        className="h-10 w-10 rounded-full bg-neutral-50"
                        src={community.image || "/user.png"}
                        alt={community.name}
                      />
                      <div>
                        <div className="text-primarytextcolor text-lg font-ubuntu">
                          {community.name}
                        </div>
                        <div className="text-primarytextcolor text-sm font-light font-ubuntu">
                          {community.description}
                        </div>
                        <div className="text-primarytextcolor text-sm font-light font-ubuntu">
                          Category: {community.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : ""}
          </div>
          <div className="w-full flex justify-center">
            {suggestions.suggestedUsers.length > 0
              ? suggestions.suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className=" hover:bg-neutral-100 bg-neutral-50  my-2 px-4 py-1 rounded-xl  w-[75%]"
                  >
                    <div className="flex justify-start items-center gap-2">
                      <img
                        className="h-10 w-10 rounded-full bg-neutral-50"
                        src={user.image || "/user.png"}
                        alt={user.name}
                      />
                      <div>
                        <Link to={`/${user.username}`}>
                          <div className="text-primarytextcolor text-lg font-ubuntu">
                            {user.username}
                          </div>
                        </Link>
                        <Link to={`/${user.username}`}>
                          <div className="text-primarytextcolor text-sm font-light font-ubuntu">
                            @{user.name}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              : ""}
          </div>
        </div>
      )}
    </div>
  );
};
