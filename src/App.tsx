import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "./components/User/Auth/Auth";
import { Home } from "./components/Home/Home";
import { Profile } from "./components/User/Profile/Profile";
import { Post } from "./components/User/Post/Post";
import { Search } from "./components/Search/Search";
import { Settings } from "./components/User/Settings/Settings";
import { UserProvider } from "./components/User/Context/UserContext";
import { Policies } from "./components/Policies/Policies";
import { Notifications } from "./components/Notifications/Notifications";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/policies" element={<Policies />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:username"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifs"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <Post isCommunityPost={false} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
