import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { OtherUserProfile } from "./pages/OtherUserProfile";
import { Post } from "./pages/Post";
import { KribbleTv } from "./pages/KribbleTv";
interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute element={<Home />} />} />

          <Route
            path="/profile"
            element={<ProtectedRoute element={<Profile />} />}
          />
          <Route path="/post" element={<ProtectedRoute element={<Post />} />} />
          <Route
            path="/user/:otherUser"
            element={<ProtectedRoute element={<OtherUserProfile />} />}
          />
          <Route
            path="/kribbletv"
            element={<ProtectedRoute element={<KribbleTv />} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
