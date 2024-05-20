import { useNavigate } from "react-router-dom";

export const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="top-0 md:hidden rounded-sm h-12 border-b  border-bordermain bg-bgmain fixed w-full">
      <div className="w-full h-full text-xl font-ubuntu  flex justify-center items-center text-textmain">
        <div
          onClick={() => {
            navigate("/");
          }}
        >
          <img src="/f.png" className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
