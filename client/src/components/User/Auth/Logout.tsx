import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="text-light text-lg font-ubuntu font-normal">
        Do you really want to logout?
        <div className="flex justify-evenly my-5">
          <button
            onClick={logout}
            className="text-semilight bg-rosemain font-normal px-4 rounded-lg"
          >
            Log out
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="text-dark bg-light font-normal px-4 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
