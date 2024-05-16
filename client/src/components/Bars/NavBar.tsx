import { useNavigate } from "react-router-dom";

export const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="top-0 md:hidden rounded-sm h-12 border-b  border-bordermain bg-bgmain fixed w-full lg:w-[35%]">
      <div className="w-full h-full text-xl font-ubuntu  flex justify-center items-center text-textmain">
        <div
          onClick={() => {
            navigate("/");
          }}
        ></div>
      </div>
    </div>
  );
};
