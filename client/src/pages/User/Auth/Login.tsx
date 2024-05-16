import { LoginAuth } from "../../../components/User/Auth/LoginAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export const Login = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token != null) {
      navigate("/");
    }
  });
  return <LoginAuth />;
};
