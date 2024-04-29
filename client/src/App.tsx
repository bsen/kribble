import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { CreatePost } from "./pages/CreatePost";
import { Konnect } from "./pages/Konnect";
import { Post } from "./pages/Post";
import { Matches } from "./pages/Matches";
import { Communities } from "./pages/Communities";
import { Followers } from "./pages/Followers";
import { Following } from "./pages/Following";
import { UserCommunities } from "./pages/UserCommunities";
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
            path="/communities"
            element={<ProtectedRoute element={<Communities />} />}
          />
          <Route
            path="/:username/communities"
            element={<ProtectedRoute element={<UserCommunities />} />}
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
            path="/konnect"
            element={<ProtectedRoute element={<Konnect />} />}
          />
          <Route
            path="/matches"
            element={<ProtectedRoute element={<Matches />} />}
          />
          <Route
            path="/followers/:username"
            element={<ProtectedRoute element={<Followers />} />}
          />
          <Route
            path="/following/:username"
            element={<ProtectedRoute element={<Following />} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
