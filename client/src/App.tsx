import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Signup } from "./pages/User/Auth/Signup";
import { Login } from "./pages/User/Auth/Login";
import { Home } from "./pages/Home";
import { Profile } from "./pages/User/Profile/Profile";
import { CreatePost } from "./pages/User/Create/CreatePost";
import { Connect } from "./pages/Connect/Connect/Connect";
import { Post } from "./pages/Post/Post";
import { Matches } from "./pages/Connect/Matches/Matches";
import { Communities } from "./pages/Community/Communities/Communities";
import { Followers } from "./pages/User/Follow/Followers";
import { Following } from "./pages/User/Follow/Following";
import { CreateCommunity } from "./pages/User/Create/CreateCommunity";
import { Community } from "./pages/Community/Profile/Community";
import { Comments } from "./pages/User/Comments/Comments";
import { CreatedCommunities } from "./pages/User/Communities/CreatedCommunities";
import { CommunityPost } from "./pages/Community/Create/CommunityPost";
import { Search } from "./pages/Search";
import { UpdateProfile } from "./pages/User/Profile/Update";
import { UpdateCommunity } from "./pages/Community/Profile/Update";
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
            element={<ProtectedRoute element={<CommunityPost />} />}
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
            element={<ProtectedRoute element={<CreatedCommunities />} />}
          />
          <Route
            path="/edit/profile"
            element={<ProtectedRoute element={<UpdateProfile />} />}
          />
          <Route
            path="/edit/community/:name"
            element={<ProtectedRoute element={<UpdateCommunity />} />}
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
