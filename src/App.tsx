import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Signup } from "./pages/User/Auth/Signup";
import { Login } from "./pages/User/Auth/Login";
import { Home } from "./pages/Home/Home";
import { Profile } from "./pages/User/Profile/Profile";
import { CreatePost } from "./pages/User/Create/CreatePost";
import { Matching } from "./pages/Matching/Matching";
import { Post } from "./pages/Post/Post";
import { Communities } from "./pages/Community/Communities/Communities";
import { CreateCommunity } from "./pages/User/Create/CreateCommunity";
import { Comments } from "./pages/User/Comments/Comments";
import { CommunityPost } from "./pages/Community/Create/CommunityPost";
import { Search } from "./pages/Search/Search";
import { UpdateProfile } from "./pages/User/Profile/Update";
import { UpdateCommunity } from "./pages/Community/Profile/Update";
import { UserProvider } from "./components/User/Context/UserContext";
import { IncognitoPosts } from "./pages/User/IncognitoPosts/IncognitoPosts";
import { About } from "./pages/About/About";
import { Community } from "./pages/Community/Profile/Community";
import { Notifications } from "./pages/Notifications/Notification";
import { LeaderBoard } from "./pages/LeaderBoard/LeaderBoard";
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
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute element={<Home />} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/policies" element={<About />} />

            <Route
              path="/:username"
              element={<ProtectedRoute element={<Profile />} />}
            />
            <Route
              path="/notifications"
              element={<ProtectedRoute element={<Notifications />} />}
            />
            <Route
              path="/comments"
              element={<ProtectedRoute element={<Comments />} />}
            />
            <Route
              path="/leaderboard"
              element={<ProtectedRoute element={<LeaderBoard />} />}
            />
            <Route
              path="/hidden/posts"
              element={<ProtectedRoute element={<IncognitoPosts />} />}
            />
            <Route
              path="/communities"
              element={<ProtectedRoute element={<Communities />} />}
            />
            <Route
              path="/edit/community/:name"
              element={<ProtectedRoute element={<UpdateCommunity />} />}
            />
            <Route
              path="/create/community"
              element={<ProtectedRoute element={<CreateCommunity />} />}
            />
            <Route
              path="/community/:name"
              element={<ProtectedRoute element={<Community />} />}
            />
            <Route
              path="/create/post"
              element={<ProtectedRoute element={<CreatePost />} />}
            />
            <Route
              path="/:name/create/post/"
              element={<ProtectedRoute element={<CommunityPost />} />}
            />
            <Route
              path="/post/:postId"
              element={<ProtectedRoute element={<Post />} />}
            />
            <Route
              path="/matching"
              element={<ProtectedRoute element={<Matching />} />}
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
      </UserProvider>
    </>
  );
}

export default App;
