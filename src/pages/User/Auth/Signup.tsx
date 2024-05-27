import { useEffect } from "react";
import { SignupAuth } from "../../../components/User/Auth/SignupAuth";
import { useNavigate } from "react-router-dom";
export const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token != null) {
      navigate("/");
    }
  }, []);
  return <SignupAuth />;
};
