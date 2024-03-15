import { useEffect } from "react";
import { Quote } from "../components/Quote";
import { SignupAuth } from "../components/SignupAuth";
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
      <SignupAuth />
      <Quote />
    </div>
  );
};
