import { useNavigate } from "react-router-dom";

export const Logout = () => {
  async function logout() {
    const navigate = useNavigate();
    localStorage.removeItem("token");
    localStorage.removeItem("storageUser");

    navigate("/login");
  }
  return (
    <div className="h-screen w-full absolute bg-black/90 flex justify-center items-center">
      <div className="text-white text-xl font-mono">
        Do you really want to logout?
        <div className="flex justify-evenly my-5">
          <button
            onClick={logout}
            className="text-neutral-300 px-4 py-1 border border-neutral-300 rounded-lg font-thin"
          >
            YES
          </button>
          <button className="text-neutral-300 px-5 py-1 border border-neutral-300 rounded-lg font-thin">
            NO
          </button>
        </div>
      </div>
    </div>
  );
};
