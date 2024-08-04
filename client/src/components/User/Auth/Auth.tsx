import { useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./Firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { CircularProgress } from "@mui/material";

export const Auth = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { setCurrentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<string>("");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, []);

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      const photoURL = result.user.photoURL;
      const idToken = await result.user.getIdToken();
      console.log(result.user.email);

      if (email) {
        await authenticate(email, photoURL || "", idToken);
      } else {
        setPopup("Failed to retrieve email from Google");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setPopup("Google Sign-In failed. Please try again.");
    }
  };

  const authenticate = async (
    email: string,
    photoURL: string,
    idToken: string
  ) => {
    const userData = {
      email,
      photoURL,
      idToken,
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
      setIsLoading(false);
      console.error(error);
      setPopup("Network error, try again later");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-orange-600  flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div className="flex items-center flex-col">
          <img src="/favicon.png" className="h-16" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-neutral-900">
            Kribble
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Express yourself in snapshots and quick clips.
            <br />
            Your creativity, your Kribble.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogle}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-900 focus:outline-none  shadow-sm transition-all duration-500 ease-in-out transform hover:scale-105"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <img src="/google.png" alt="Google logo" className="h-5 w-5" />
            </span>
            Sign in with Google
          </button>
          {popup && (
            <p className="mt-2 text-center text-sm text-red-600">{popup}</p>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-200">
          © 2024 Kribble. A product by Algabay Private Limited
        </p>
        <Link
          to="/policies"
          className="mt-2 inline-block text-xs text-neutral-200 hover:text-white bg-black bg-opacity-20 hover:bg-opacity-30 py-1 px-4 rounded-full transition duration-150 ease-in-out"
        >
          Policies
        </Link>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-screen w-full flex items-center justify-center">
          <CircularProgress size={24} sx={{ color: "inherit" }} />
        </div>
      )}
    </div>
  );
};
