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
          className="bg-white text-indigo-500  py-1 px-2 rounded-lg text-sm font-ubuntu font-medium"
        >
          FriendCity
        </div>
      </div>
    </div>
  );
};
