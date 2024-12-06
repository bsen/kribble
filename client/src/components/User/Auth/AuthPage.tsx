import { useContext, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./Firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { UserContext } from "../Context/UserContext";
import { EMAIL_AUTH_KEY } from "../../../config";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<string>("");

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      console.log(result);
      const email = result.user.email;
      const photoURL = result.user.photoURL;
      if (email) {
        await authenticate(email, photoURL || "");
      } else {
        setPopup("Failed to retrieve email from Google");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setPopup("Google Sign-In failed. Please try again.");
    }
  };

  const authenticate = async (email: string, photoURL: string) => {
    const userData = {
      email,
      photoURL,
      EMAIL_AUTH_KEY,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/auth/authentication`,
        userData
      );
      setIsLoading(false);
      if (response.data.status === 200) {
        setPopup("Authentication successful");
        localStorage.setItem("token", response.data.token);
        setCurrentUser(response.data.username);
        navigate("/");
      } else {
        setPopup(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setPopup("Network error, try again later");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center w-full">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col justify-center bg-black items-center">
      <div className="w-72 bg-dark p-5 rounded-lg flex flex-col items-center gap-4">
        <div className="text-semilight  flex flex-col justify-center items-center gap-3 text-center font-ubuntu font-medium text-[2.5rem]">
          <img src="/friendcity.png" className="h-10 mt-1" />

          <div className="text-center text-sm font-thin  text-light">
            Share your thoughts 🚀, pics, and dive into vibrant communities.
            With anonymous posting, let your thoughts soar freely.
          </div>
        </div>
        <div className="w-full">
          <button
            type="button"
            className="rounded-md text-base p-2 text-light bg-indigomain flex items-center gap-4 w-full"
            onClick={handleGoogle}
          >
            <img src="/google.png" className="h-6 w-6" alt="Google logo" />
            Authenticate with Google
          </button>
        </div>

        {popup && (
          <div className="text-rosemain text-sm text-center">{popup}</div>
        )}
        <footer className="w-full text-center font-ubuntu py-2 text-xs flex flex-col gap-2 items-center justify-center text-neutral-600">
          © 2024 friendcity. A product by Algabay Private Limited
          <Link to="/policies" className="underline">
            Policies
          </Link>
        </footer>
      </div>
    </div>
  );
};
