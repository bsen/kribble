import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { CreatePost } from "./pages/CreatePost";
import { KribConnect } from "./pages/KribConnect";
import { Post } from "./pages/Post";
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
            path="/:username"
            element={<ProtectedRoute element={<Profile />} />}
          />
          <Route
            path="/create/post"
            element={<ProtectedRoute element={<CreatePost />} />}
          />
          <Route
            path="/post/:postId"
            element={<ProtectedRoute element={<Post />} />}
          />
          <Route
            path="/kribconnect"
            element={<ProtectedRoute element={<KribConnect />} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
