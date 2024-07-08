import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "./pages/User/Auth/Auth";
import { Home } from "./pages/Home/Home";
import { Profile } from "./pages/User/Profile/Profile";
import { CreatePost } from "./pages/User/Create/CreatePost";
import { Post } from "./pages/Post/Post";
import { Communities } from "./pages/Community/Communities/Communities";
import { CreateCommunity } from "./pages/User/Create/CreateCommunity";
import { Comments } from "./pages/User/Comments/Comments";
import { Search } from "./pages/Search/Search";
import { UpdateProfile } from "./pages/User/Profile/Update";
import { UpdateCommunity } from "./pages/Community/Profile/Update";
import { UserProvider } from "./components/User/Context/UserContext";
import { IncognitoPosts } from "./pages/User/IncognitoPosts/IncognitoPosts";
import { About } from "./pages/About/About";
import { Community } from "./pages/Community/Profile/Community";
import { NotificationsComponent } from "./components/Notifications/NotificationsComponent";
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
              path="/community/:name"
              element={<ProtectedRoute element={<Community />} />}
            />
            <Route
              path="/communities"
              element={<ProtectedRoute element={<Communities />} />}
            />
            <Route
              path="/notifs"
              element={<ProtectedRoute element={<NotificationsComponent />} />}
            />
            <Route
              path="/comments"
              element={<ProtectedRoute element={<Comments />} />}
            />
            <Route
              path="/hidden/posts"
              element={<ProtectedRoute element={<IncognitoPosts />} />}
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
