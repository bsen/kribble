import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("storageUser");
    navigate("/login");
  }
  return (
    <div className="h-screen w-full absolute bg-black/90 flex justify-center items-center">
      <div className="text-white text-lg font-ubuntu font-semibold">
        Do you really want to logout?
        <div className="flex justify-evenly my-5">
          <button
            onClick={logout}
            className="text-black bg-black hover:bg-neutral-200 font-semibold px-4 py-1 border border-neutral-300 rounded-full"
          >
            Log out
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="text-white bg-neutral-800 hover:bg-neutral-900 font-semibold px-4 py-1 border border-neutral-800 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
