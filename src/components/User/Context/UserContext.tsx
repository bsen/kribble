import {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../config";

interface UserContextType {
  currentUser: any;
  isLoading: boolean;
  setCurrentUser: Dispatch<SetStateAction<any>>;
}

const defaultValue: UserContextType = {
  currentUser: null,
  isLoading: true,
  setCurrentUser: () => {},
};

export const UserContext = createContext<UserContextType>(defaultValue);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.post(
            `${BACKEND_URL}/api/user/auth/verify`,
            { token }
          );
          if (response.data.status === 200) {
            setCurrentUser(response.data.data);
          } else if (response.data.status === 901) {
            localStorage.clear();
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const value: UserContextType = { currentUser, isLoading, setCurrentUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
