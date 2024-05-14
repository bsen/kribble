import { useNavigate } from "react-router-dom";

export const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="top-0 rounded-b-md h-12 shadow-sm bg-white fixed w-full lg:w-[50%]">
      <div className="w-full h-full flex justify-center items-center">
        <div
          onClick={() => {
            navigate("/");
          }}
        >
          <img src="/logo.png" className="h-8" />
        </div>
      </div>
    </div>
  );
};
