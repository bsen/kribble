import { Quote } from "../components/Auth/Quote";
import { LoginAuth } from "../components/Auth/LoginAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export const Login = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token != null) {
      navigate("/home");
    }
  });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <Quote />
      <LoginAuth />
    </div>
  );
};
