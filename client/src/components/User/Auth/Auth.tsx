import { useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./Firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { motion } from "framer-motion";

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
    idToken: string,
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
        userData,
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <img
        src="/bg.jpg"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 z-10"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8 bg-white/10 bg-opacity-80 p-10 rounded-2xl shadow-2xl relative z-20 border border-gray-700 backdrop-filter backdrop-blur-sm"
      >
        <div className="flex flex-col items-center">
          <img src="/favicon.png" alt="Kribble logo" className="h-20 w-auto" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Kribble
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300 max-w-sm">
            Express yourself in snapshots and quick clips.
            <br />
            Your creativity, your Kribble.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <button
            onClick={handleGoogle}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          {popup && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center text-sm text-red-400"
            >
              {popup}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-center relative z-20"
      >
        <p className="text-xs text-gray-400">
          © 2024 Kribble. All rights reserved.
        </p>
        <Link
          to="/policies"
          className="mt-2 inline-block text-xs text-indigo-400 hover:text-indigo-300 transition duration-300 ease-in-out"
        >
          Privacy Policy & Terms of Service
        </Link>
      </motion.div>
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
};
