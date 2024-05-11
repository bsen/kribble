import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { CreatePost } from "./pages/CreatePost";
import { Connect } from "./pages/Connect";
import { Post } from "./pages/Post";
import { Matches } from "./pages/Matches";
import { Communities } from "./pages/Communities";
import { Followers } from "./pages/Followers";
import { Following } from "./pages/Following";
import { CreateCommunity } from "./pages/CreateCommunity";
import { Community } from "./pages/Community";
import { Comments } from "./pages/Comments";
import { UserCommunities } from "./pages/UserCommunities";
import { CreateCommunityPost } from "./pages/CreateCommunityPost";
import { Search } from "./pages/Search";
import { EditProfile } from "./pages/EditProfile";
import { EditCommunity } from "./pages/EditCommunity";
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
            path="/comments"
            element={<ProtectedRoute element={<Comments />} />}
          />
          <Route
            path="/communities"
            element={<ProtectedRoute element={<Communities />} />}
          />
          <Route
            path="/community/:name"
            element={<ProtectedRoute element={<Community />} />}
          />
          <Route
            path="/create/community"
            element={<ProtectedRoute element={<CreateCommunity />} />}
          />
          <Route
            path="/create/post"
            element={<ProtectedRoute element={<CreatePost />} />}
          />
          <Route
            path="/community/:name/post"
            element={<ProtectedRoute element={<CreateCommunityPost />} />}
          />
          <Route
            path="/post/:postId"
            element={<ProtectedRoute element={<Post />} />}
          />
          <Route
            path="/connect"
            element={<ProtectedRoute element={<Connect />} />}
          />
          <Route
            path="/user/matches"
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
          <Route
            path="/user/communities"
            element={<ProtectedRoute element={<UserCommunities />} />}
          />
          <Route
            path="/edit/profile"
            element={<ProtectedRoute element={<EditProfile />} />}
          />
          <Route
            path="/edit/community/:id"
            element={<ProtectedRoute element={<EditCommunity />} />}
          />
          <Route
            path="/search"
            element={<ProtectedRoute element={<Search />} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
