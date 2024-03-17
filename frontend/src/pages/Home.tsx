import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
export const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Sidebar />
    </div>
  );
};
