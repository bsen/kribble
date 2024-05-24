import { useNavigate } from "react-router-dom";

export const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="top-0 lg:hidden rounded-sm h-12 border-b  border-semidark bg-dark fixed w-full">
      <div className="w-full h-full text-xl font-ubuntu  flex justify-center items-center text-light">
        <div
          onClick={() => {
            navigate("/");
          }}
          className="bg-gradient-to-r from-indigo-500 to-orange-500 via-purple-500 text-transparent bg-clip-text text-xl font-ubuntu"
        >
          FriendCity
        </div>
      </div>
    </div>
  );
};
