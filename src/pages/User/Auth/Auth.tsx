import { useEffect } from "react";
import { AuthPage } from "../../../components/User/Auth/AuthPage";
import { useNavigate } from "react-router-dom";
export const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token != null) {
      navigate("/");
    }
  }, []);
  return <AuthPage />;
};
