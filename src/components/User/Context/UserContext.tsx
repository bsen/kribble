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
  currentUser: any; // Update this type according to your user data structure
  isLoading: boolean;
  setCurrentUser: Dispatch<SetStateAction<any>>; // Type for the setCurrentUser function
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
          setCurrentUser(response.data.data);
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
