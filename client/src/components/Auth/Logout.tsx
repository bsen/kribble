import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }
  return (
    <div className="h-screen w-full absolute bg-background/90 flex justify-center items-center">
      <div className="text-primarytextcolor text-lg font-ubuntu font-semibold">
        Do you really want to logout?
        <div className="flex justify-evenly my-5">
          <button
            onClick={logout}
            className="text-white bg-red-500 hover:bg-red-400 font-semibold px-4 py-1 rounded-full"
          >
            Log out
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="text-white bg-neutral-800 hover:bg-neutral-900 font-semibold px-4 py-1 border border-neutral-200 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
