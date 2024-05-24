import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }
  return (
    <div className="h-screen w-full border-r border-l border-semidark bg-dark flex justify-center items-center">
      <div className="text-light text-lg font-ubuntu font-normal">
        Do you really want to logout?
        <div className="flex justify-evenly my-5">
          <button
            onClick={logout}
            className="text-semilight bg-red-500 hover:bg-red-400 font-normal px-4 py-1 rounded-lg"
          >
            Log out
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="text-semilight bg-neutral-800 hover:bg-neutral-900 font-normal px-4 py-1 border border-semidark rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
