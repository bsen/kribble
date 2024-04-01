import { useEffect } from "react";
import { Quote } from "../components/Auth/Quote";
import { SignupAuth } from "../components/Auth/SignupAuth";
import { useNavigate } from "react-router-dom";
export const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token != null) {
      navigate("/home");
    }
  }, []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <Quote />
      <SignupAuth />
    </div>
  );
};
