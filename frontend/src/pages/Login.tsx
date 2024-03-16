import { Quote } from "../components/Quote";
import { LoginAuth } from "../components/LoginAuth";
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
      <div className="max-md:hidden">
        <Quote />
      </div>
      <LoginAuth />
      <div className="md:hidden">
        <Quote />
      </div>
    </div>
  );
};
