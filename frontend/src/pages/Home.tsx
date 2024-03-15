import { useNavigate } from "react-router-dom";
export const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      Home Page
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        signout
      </button>
    </div>
  );
};
