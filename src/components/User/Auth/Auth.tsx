import { useContext, useState } from "react";
import { BACKEND_URL } from "../../../config";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./Firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography, Modal } from "@mui/material";
import { UserContext } from "../Context/UserContext";

export const Auth = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<string>("");

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
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: 400 },
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <div className="font-medium text-2xl">Kribble (friendcity)</div>
        <div className="text-semilight text-center text-xs">
          Express yourself in snapshots and quick clips.
          <br />
          Your creativity, your Kribble.
        </div>

        <button
          className="flex items-center gap-2 bg-light py-1 px-4 rounded-full text-semidark"
          onClick={handleGoogle}
        >
          <img
            src="/google.png"
            alt="Google logo"
            style={{ width: 20, height: 20 }}
          />
          Sign in with Google
        </button>
        {popup && (
          <Typography
            variant="body2"
            sx={{ color: "error.main", textAlign: "center" }}
          >
            {popup}
          </Typography>
        )}

        <div className="flex flex-col items-center gap-2">
          <div className="text-semilight text-center text-xs">
            © 2024 Kribble. A product by Algabay Private Limited
          </div>
          <Link
            to="/policies"
            className="text-xs text-semilight bg-semidark py-1 px-4 w-fit rounded-full"
          >
            Policies
          </Link>
        </div>
      </Box>
      <Modal
        open={isLoading}
        aria-labelledby="loading-modal"
        aria-describedby="loading-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "black",
            outline: "none",
          }}
        >
          <CircularProgress size={24} color="inherit" />
        </Box>
      </Modal>
    </Box>
  );
};
