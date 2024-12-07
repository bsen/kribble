import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "./pages/User/Auth/Auth";
import { Home } from "./pages/Home/Home";
import { Profile } from "./pages/User/Profile/Profile";
import { CreatePost } from "./pages/User/Create/CreatePost";
import { Post } from "./pages/Post/Post";
import { CreateCommunity } from "./pages/User/Create/CreateCommunity";
import { Comments } from "./pages/User/Comments/Comments";
import { Search } from "./pages/Search/Search";
import { UpdateProfile } from "./pages/User/Profile/Update";
import { UserProvider } from "./components/User/Context/UserContext";
import { About } from "./pages/About/About";
import { AnonPosts } from "./pages/User/AnonPosts/AnonPosts";

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/auth" replace />;
};
const PublicRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : element;
};
function App() {
  return (
    <>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/policies" element={<About />} />
            <Route path="/" element={<ProtectedRoute element={<Home />} />} />
            <Route
              path="/:username"
              element={<ProtectedRoute element={<Profile />} />}
            />
            <Route path="/auth" element={<PublicRoute element={<Auth />} />} />
            <Route
              path="/comments"
              element={<ProtectedRoute element={<Comments />} />}
            />
            <Route
              path="/hidden/posts"
              element={<ProtectedRoute element={<AnonPosts />} />}
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute
                  element={<CreatePost isCommunityPost={false} />}
                />
              }
            />
            <Route
              path="/create/:name"
              element={
                <ProtectedRoute
                  element={<CreatePost isCommunityPost={true} />}
                />
              }
            />

            <Route
              path="/post/:postId"
              element={<ProtectedRoute element={<Post />} />}
            />

            <Route
              path="/edit/profile"
              element={<ProtectedRoute element={<UpdateProfile />} />}
            />
            <Route
              path="/search"
              element={<ProtectedRoute element={<Search />} />}
            />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </>
  );
}

export default App;
